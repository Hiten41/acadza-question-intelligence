import { describe, expect, it } from "vitest";
import questionRows from "../../data/questions.json";
import reportRows from "../../data/reports.json";
import taxonomy from "../../data/taxonomy.json";
import resultRows from "../../results.json";
import { calculatePriority } from "./investigation";
import {
  actionEligibility, filterAudit, filterReviewCases, groupReviewCases, inlineDifference, loadLocalState, persistLocalState,
  proposedValue, resetLocalState, searchReviewCase,
} from "./review";
import type { AuditEntry, InvestigationResult, LocalDecision, PersistedState, Question, Report } from "./types";

const questions = questionRows as Question[];
const reports = reportRows as Report[];
const results = resultRows as InvestigationResult[];
const repairs = taxonomy.repairs as Record<string, { fields: string[]; auto: boolean }>;
const cases = groupReviewCases(questions, reports, results, calculatePriority);
const memoryStorage = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); },
    data,
  };
};

describe("review queue derivation and search", () => {
  it("searches report ID, comment, question ID, source, and original question/solution/answer content", () => {
    const item = cases.find((candidate) => candidate.reports.some((report) => report.reportId === "R001"))!;
    expect(searchReviewCase(item, "R001")).toBe(true);
    expect(searchReviewCase(item, item.reports[0].source)).toBe(true);
    expect(searchReviewCase(item, item.reports[0].comment.slice(0, 12))).toBe(true);
    expect(searchReviewCase(item, item.questionId)).toBe(true);
    const content = item.question![item.question!.questionType]!;
    expect(searchReviewCase(item, String(content.question).replace(/<[^>]+>/g, " ").trim().split(/\s+/)[0])).toBe(true);
    expect(searchReviewCase(item, "missing-random-term-qqq")).toBe(false);
  });

  it("combines filters and sorts matches by calculated priority", () => {
    const open: Record<string, LocalDecision> = {};
    const filtered = filterReviewCases(cases, { verdict: "defect", repair: "answer_key", route: "auto_apply", subject: "Physics", chapter: "Alternating Current and EM Waves", priority: "medium", status: "", source: "" }, open);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((item) => item.results.some((result) => result.repair === "answer_key"))).toBe(true);
    expect(filtered.map((item) => item.priority)).toEqual([...filtered.map((item) => item.priority)].sort((a: number, b: number) => b - a));
  });

  it("keeps case-level aggregation separate from every report-level verdict", () => {
    const grouped = cases.find((item) => item.reports.some((report) => report.reportId === "R001"))!;
    expect(grouped.reports.map((report) => report.reportId)).toEqual(expect.arrayContaining(["R001", "R002", "R003"]));
    expect(grouped.results.map((result) => result.reportId)).toEqual(expect.arrayContaining(["R001", "R002", "R003"]));
    expect(grouped.verdict).toBe("defect");
    expect(grouped.results.length).toBe(grouped.reports.length);
  });

  it("orders high-priority grouped defects above lower-priority no-change cases", () => {
    const sorted = filterReviewCases(cases, { verdict: "", repair: "", route: "", subject: "", chapter: "", priority: "", status: "", source: "" }, {});
    expect(sorted[0].priority).toBeGreaterThanOrEqual(sorted.at(-1)!.priority);
  });

  it("highlights the exact changed fragment and unchanged context", () => {
    expect(inlineDifference("work frictional force is equal to (in N) here", "work frictional force is equal to (in newtons) here")).toMatchObject({
      beforeContext: "nal force is equal to (in ", removed: "N", inserted: "newtons", afterContext: ") here",
    });
    expect(inlineDifference("C", "A")).toMatchObject({ removed: "C", inserted: "A" });
  });
});

describe("safety gate and typed proposal validation", () => {
  it("permits R001 to stage only through the auto route and official answer-key taxonomy", () => {
    const result = results.find((item) => item.reportId === "R001")!;
    const question = questions.find((item) => item._id === result.questionId)!;
    expect(actionEligibility({ result, question, repairs, mode: "stage" }).ok).toBe(true);
    expect(proposedValue(result, question)).toBe("A");
  });

  it("revalidates a faculty-edited replacement and rejects unsafe or empty text", () => {
    const result = results.find((item) => item.reportId === "R001")!;
    const question = questions.find((item) => item._id === result.questionId)!;
    expect(actionEligibility({ result, question, repairs, mode: "stage", editedValue: "<script>alert(1)</script>" }).ok).toBe(false);
    expect(actionEligibility({ result, question, repairs, mode: "stage", editedValue: "" }).ok).toBe(false);
    expect(actionEligibility({ result, question, repairs, mode: "stage", editedValue: "B" }).ok).toBe(true);
  });

  it("blocks human-only repairs from automatic staging", () => {
    const question = { _id: "q-human", questionType: "scq", scq: { question: "Stem", solution: "Work", answer: "A" } } as Question;
    const result = { reportId: "R-human", questionId: question._id, verdict: "defect", repair: "wrong_chapter", edit: { field: "question", find: "Stem", replace: "Updated stem" }, route: "auto_apply", confidence: 0.99, evidence: "review", student_reply: "Thanks." } satisfies InvestigationResult;
    expect(actionEligibility({ result, question, repairs, mode: "stage" }).ok).toBe(false);
  });

  it("preserves array answer type and validates changed arrays without string coercion", () => {
    const question = { _id: "q-array", questionType: "mcq", mcq: { question: "Stem", solution: "Work", answer: ["A", "C"] } } as Question;
    const result = { reportId: "R-array", questionId: question._id, verdict: "defect", repair: "answer_key", edit: { field: "answer", find: JSON.stringify(["A", "C"]), replace: "B" }, route: "auto_apply", confidence: 0.99, evidence: "review", student_reply: "Thanks." } satisfies InvestigationResult;
    expect(actionEligibility({ result, question, repairs, mode: "stage" }).ok).toBe(false);
    expect(actionEligibility({ result, question, repairs, mode: "stage", editedValue: ["B", "C"] }).ok).toBe(true);
    expect(actionEligibility({ result, question, repairs, mode: "stage", editedValue: "B" }).ok).toBe(false);
  });

  it("marks faculty review as a required gate without calling it a failed check", () => {
    const result = results.find((item) => item.route === "faculty_review" && item.edit && item.repair && repairs[item.repair]?.auto)!;
    const question = questions.find((item) => item._id === result.questionId)!;
    expect(actionEligibility({ result, question, repairs, mode: "approve" }).ok).toBe(true);
  });
});

describe("browser-local persistence and audit filters", () => {
  it("loads empty, valid, migrated, and corrupted state safely", () => {
    expect(loadLocalState(memoryStorage())).toMatchObject({ version: 2, decisions: {}, audit: [] });
    expect(loadLocalState(memoryStorage({ "acadza-question-intelligence:v2": "{bad" })).audit).toEqual([]);
    const migrated = loadLocalState(memoryStorage({ "acadza-question-intelligence:v1": JSON.stringify({ decisions: { q1: { status: "applied", editedValue: "new" } }, audit: [], studentReplies: {} }) }));
    expect(migrated.decisions.q1).toEqual({ status: "staged", editedValue: "new" });
    const current: PersistedState = { version: 2, decisions: { q1: { status: "rejected" } }, audit: [], studentReplies: {} };
    expect(loadLocalState(memoryStorage({ "acadza-question-intelligence:v2": JSON.stringify(current) })).decisions.q1.status).toBe("rejected");
  });

  it("handles blocked storage and explicit reset without throwing", () => {
    const blocked = { setItem: () => { throw new Error("storage blocked"); }, removeItem: () => { throw new Error("storage blocked"); } };
    const state: PersistedState = { version: 2, decisions: {}, audit: [], studentReplies: {} };
    expect(persistLocalState(blocked, state)).toBe(false);
    expect(resetLocalState(blocked)).toBe(false);
    const storage = memoryStorage({ "acadza-question-intelligence:v2": "x", "acadza-question-intelligence:v1": "y" });
    expect(resetLocalState(storage)).toBe(true);
    expect(storage.data.size).toBe(0);
  });

  it("filters audit by action, date, question and report, preserving snapshots", () => {
    const entries: AuditEntry[] = [
      { id: "a1", reportIds: ["R001", "R002"], questionId: "q-lcr", action: "staged", actor: "Faculty", note: "Safe stage", at: "2026-11-10T10:00:00.000Z", previousStatus: null, newStatus: "staged", field: "answer", before: "C", after: "A", reason: "Verified" },
      { id: "a2", reportIds: ["R005"], questionId: "q2", action: "rejected", actor: "Faculty", note: "Rejected", at: "2026-11-09T10:00:00.000Z", previousStatus: null, newStatus: "rejected" },
    ];
    expect(filterAudit(entries, { action: "staged", date: "2026-11-10", questionId: "q-lcr", reportId: "R002" })).toHaveLength(1);
    expect(filterAudit(entries, { action: "", date: "", questionId: "", reportId: "missing" })).toHaveLength(0);
    expect(entries[0].before).toBe("C");
    expect(entries[0].after).toBe("A");
  });

  it("retains source MathML unchanged for renderer verification", () => {
    const withMath = questions.find((question) => /<math\b/.test(question[question.questionType]?.question ?? ""));
    expect(withMath).toBeDefined();
    expect(withMath![withMath!.questionType]?.question).toMatch(/<math\b/);
  });
});
