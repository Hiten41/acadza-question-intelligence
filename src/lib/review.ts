import type { AuditEntry, InvestigationResult, LocalDecision, PersistedState, Question, Report } from "./types";
import { isSafeAutoRepair } from "./route-safety.mjs";

export type RepairPolicy = { fields: string[]; auto: boolean; label?: string };
export type ReviewCase = {
  questionId: string;
  question?: Question;
  reports: Report[];
  results: InvestigationResult[];
  verdict: InvestigationResult["verdict"];
  route: InvestigationResult["route"];
  priority: number;
  latest: string;
  proposal?: InvestigationResult;
};

export type QueueFilters = {
  verdict: string;
  repair: string;
  route: string;
  subject: string;
  chapter: string;
  priority: string;
  status: string;
  source: string;
};

export const EMPTY_STATE: PersistedState = { version: 2, decisions: {}, audit: [], studentReplies: {} };
const legacyKey = "acadza-question-intelligence:v1";

export function groupReviewCases(questions: Question[], reports: Report[], results: InvestigationResult[], priority: (result: InvestigationResult, reportCount: number) => number): ReviewCase[] {
  const questionsById = new Map(questions.map((question) => [question._id, question]));
  const resultsByReport = new Map(results.map((result) => [result.reportId, result]));
  const reportsByQuestion = new Map<string, Report[]>();
  for (const report of reports) reportsByQuestion.set(report.questionId, [...(reportsByQuestion.get(report.questionId) ?? []), report]);
  return [...reportsByQuestion].map(([questionId, linkedReports]) => {
    const caseResults = linkedReports.map((report) => resultsByReport.get(report.reportId)).filter((result): result is InvestigationResult => !!result);
    const proposal = caseResults.find((result) => result.route === "faculty_review" && result.edit)
      ?? caseResults.find((result) => result.route === "faculty_review")
      ?? caseResults.find((result) => result.edit)
      ?? caseResults[0];
    const route = caseResults.some((result) => result.route === "faculty_review") ? "faculty_review" : caseResults.some((result) => result.route === "auto_apply") ? "auto_apply" : "no_change";
    const verdict = caseResults.some((result) => result.verdict === "defect") ? "defect" : caseResults[0]?.verdict ?? "not_actionable";
    return {
      questionId,
      question: questionsById.get(questionId),
      reports: linkedReports,
      results: caseResults,
      verdict,
      route,
      priority: Math.max(0, ...caseResults.map((result) => priority(result, linkedReports.length))),
      latest: linkedReports.map((report) => report.reportedAt).sort().at(-1) ?? "",
      proposal,
    };
  });
}

export function searchReviewCase(item: ReviewCase, query: string) {
  const q = query.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim().toLocaleLowerCase("en");
  if (!q) return true;
  const content = item.question?.[item.question.questionType];
  const haystack = [item.questionId, item.question?.qid, item.question?.subject, item.question?.chapter,
    content?.question, content?.solution, Array.isArray(content?.answer) ? content.answer.join(" ") : content?.answer,
    ...item.reports.flatMap((report) => [report.reportId, report.comment, report.source])].filter(Boolean).join(" ");
  return haystack.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").toLocaleLowerCase("en").includes(q);
}

export function filterReviewCases(cases: ReviewCase[], filters: QueueFilters, decisions: Record<string, LocalDecision>, query = "") {
  return cases.filter((item) => {
    const state = decisions[item.questionId];
    return searchReviewCase(item, query)
      && (!filters.verdict || item.results.some((result) => result.verdict === filters.verdict))
      && (!filters.repair || item.results.some((result) => result.repair === filters.repair))
      && (!filters.route || item.results.some((result) => result.route === filters.route))
      && (!filters.subject || item.question?.subject === filters.subject)
      && (!filters.chapter || item.question?.chapter === filters.chapter)
      && (!filters.source || item.reports.some((report) => report.source === filters.source))
      && (!filters.priority || (filters.priority === "high" ? item.priority >= 60 : filters.priority === "medium" ? item.priority >= 35 && item.priority < 60 : item.priority < 35))
      && (!filters.status || (filters.status === "open" ? !state : state?.status === filters.status));
  }).sort((a, b) => b.priority - a.priority || b.latest.localeCompare(a.latest));
}

export function currentFieldValue(question: Question, field: NonNullable<InvestigationResult["edit"]>["field"]): unknown {
  return field === "questionType" ? question.questionType : question[question.questionType]?.[field];
}

export function proposedValue(result: InvestigationResult, question: Question, editedValue?: unknown): unknown {
  if (!result.edit) return undefined;
  if (editedValue !== undefined) return editedValue;
  const { field, find, replace, value } = result.edit;
  if (value !== undefined) return value;
  if (field === "questionType") return replace ?? question.questionType;
  const original = currentFieldValue(question, field);
  if (field === "answer") return replace ?? original;
  if (typeof original !== "string") return undefined;
  if (!find) return replace ?? original;
  if (!original.includes(find)) return undefined;
  return original.replace(find, replace ?? "");
}

export function inlineDifference(before: unknown, after: unknown) {
  const toText = (value: unknown) => Array.isArray(value) ? JSON.stringify(value) : String(value ?? "—");
  const left = [...toText(before)];
  const right = [...toText(after)];
  let prefix = 0;
  while (prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < left.length - prefix && suffix < right.length - prefix && left[left.length - 1 - suffix] === right[right.length - 1 - suffix]) suffix += 1;
  const start = Math.max(0, prefix - 26);
  const endLeft = Math.min(left.length, left.length - suffix + 26);
  const endRight = Math.min(right.length, right.length - suffix + 26);
  return {
    beforeContext: left.slice(start, prefix).join(""),
    removed: left.slice(prefix, left.length - suffix).join(""),
    inserted: right.slice(prefix, right.length - suffix).join(""),
    afterContext: left.slice(left.length - suffix, endLeft).join(""),
    rightBeforeContext: right.slice(start, prefix).join(""),
    rightAfterContext: right.slice(right.length - suffix, endRight).join(""),
  };
}

export type Eligibility = { ok: boolean; reasons: string[]; before?: unknown; after?: unknown };
export function actionEligibility(input: {
  result: InvestigationResult;
  question: Question;
  repairs: Record<string, RepairPolicy>;
  mode: "stage" | "approve" | "review";
  editedValue?: unknown;
}) : Eligibility {
  const { result, question, repairs, mode, editedValue } = input;
  const reasons: string[] = [];
  const policy = result.repair ? repairs[result.repair] : undefined;
  const edit = result.edit;
  const before = edit ? currentFieldValue(question, edit.field) : undefined;
  const after = edit ? proposedValue(result, question, editedValue) : undefined;
  if (mode === "review") return { ok: true, reasons, before, after };
  if (!policy || !result.repair) reasons.push("The repair is missing from the official taxonomy.");
  if (!edit || !policy?.fields.includes(edit.field)) reasons.push("The proposed field is outside the repair taxonomy scope.");
  if (edit && policy?.fields.includes(edit.field)) {
    if (edit.field !== "questionType" && !question[question.questionType]) reasons.push("The declared question content object is missing.");
    if (edit.field === "answer") {
      if (editedValue !== undefined) {
        if (Array.isArray(before) !== Array.isArray(after) || typeof before !== typeof after) reasons.push("The edited answer must preserve the stored answer type.");
      } else if (Array.isArray(before) && !Array.isArray(after)) reasons.push("Array answer edits require a typed array proposal.");
      if (Array.isArray(before) ? (edit.find !== undefined && JSON.stringify(before) !== edit.find) : before !== edit.find) reasons.push("The original answer no longer matches the proposed change.");
    } else if (edit.field === "questionType") {
      if (question.questionType !== edit.find) reasons.push("The original question type no longer matches the proposed change.");
      if (after !== "scq" && after !== "mcq" && after !== "integerQuestion") reasons.push("The replacement question type is invalid.");
    } else {
      if (typeof before !== "string" || !edit.find || !before.includes(edit.find)) reasons.push("The original text no longer matches the proposed change.");
      if (typeof after !== "string" || !after.trim()) reasons.push("The replacement text must be non-empty text.");
    }
    if (typeof after === "string" && /<(?:script|iframe|object|embed)\b|\son\w+\s*=/i.test(after)) reasons.push("The replacement contains disallowed active markup.");
    if (edit.field === "answer" && ((typeof after === "string" && !after.trim()) || (Array.isArray(after) && after.length === 0))) reasons.push("The replacement answer must contain at least one value.");
  }
  if (mode === "stage") {
    if (result.route !== "auto_apply" || result.verdict !== "defect") reasons.push("Only an auto-routed content defect can be staged as a safe correction.");
    if (!policy?.auto || !isSafeAutoRepair(result.repair)) reasons.push("This repair is outside the conservative automatic-staging allowlist.");
    if (!Number.isFinite(result.confidence) || result.confidence < 0.95) reasons.push("The offline score is below the 95% staging threshold.");
    if (!question[question.questionType]?.question || !question[question.questionType]?.solution || question[question.questionType]?.answer == null) reasons.push("Source validation found an unresolved missing-content warning.");
  }
  if (mode === "approve") {
    if (result.route !== "faculty_review" || result.verdict !== "defect") reasons.push("This proposal is not routed for faculty correction approval.");
    if (!policy?.auto) reasons.push("This repair is human-authored; record a review or request further faculty work instead.");
  }
  return { ok: reasons.length === 0, reasons, before, after };
}

function isDecision(value: unknown): value is LocalDecision {
  return !!value && typeof value === "object" && ["edited", "staged", "approved", "rejected", "reviewed"].includes((value as LocalDecision).status);
}
function isAudit(value: unknown): value is AuditEntry {
  return !!value && typeof value === "object" && typeof (value as AuditEntry).id === "string"
    && Array.isArray((value as AuditEntry).reportIds) && typeof (value as AuditEntry).questionId === "string"
    && typeof (value as AuditEntry).at === "string";
}

export function loadLocalState(storage: Pick<Storage, "getItem">): PersistedState {
  try {
    const raw = storage.getItem("acadza-question-intelligence:v2");
    if (!raw) {
      const legacy = storage.getItem(legacyKey);
      if (!legacy) return EMPTY_STATE;
      const old = JSON.parse(legacy) as { decisions?: Record<string, { status?: string; editedValue?: unknown }>; audit?: Array<Record<string, unknown>>; studentReplies?: Record<string, string> };
      const decisions: Record<string, LocalDecision> = {};
      for (const [id, value] of Object.entries(old.decisions ?? {})) {
        const status = value?.status === "applied" ? "staged" : value?.status;
        if (["edited", "staged", "approved", "rejected", "reviewed"].includes(status ?? "")) decisions[id] = { status: status as LocalDecision["status"], ...(value.editedValue !== undefined ? { editedValue: value.editedValue } : {}) };
      }
      const audit = (old.audit ?? []).filter((entry) => !!entry && typeof entry.id === "string" && typeof entry.questionId === "string" && typeof entry.at === "string" && Array.isArray(entry.reportIds)).map((entry) => ({ ...entry, action: entry.action === "applied" ? "staged" : entry.action } as unknown as AuditEntry));
      return { version: 2, decisions, audit, studentReplies: old.studentReplies ?? {} };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (parsed.version !== 2 || !parsed.decisions || typeof parsed.decisions !== "object" || !Array.isArray(parsed.audit) || !parsed.studentReplies || typeof parsed.studentReplies !== "object") return EMPTY_STATE;
    const decisions = Object.fromEntries(Object.entries(parsed.decisions).filter((entry): entry is [string, LocalDecision] => isDecision(entry[1])));
    const studentReplies = Object.fromEntries(Object.entries(parsed.studentReplies).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
    return { version: 2, decisions, audit: parsed.audit.filter(isAudit), studentReplies };
  } catch {
    return EMPTY_STATE;
  }
}

export function persistLocalState(storage: Pick<Storage, "setItem">, state: PersistedState) {
  try { storage.setItem("acadza-question-intelligence:v2", JSON.stringify(state)); return true; } catch { return false; }
}

export function resetLocalState(storage: Pick<Storage, "removeItem">) {
  try { storage.removeItem("acadza-question-intelligence:v2"); storage.removeItem(legacyKey); return true; } catch { return false; }
}

export function filterAudit(entries: AuditEntry[], filters: { action: string; date: string; questionId: string; reportId: string }) {
  return entries.filter((entry) => (!filters.action || entry.action === filters.action)
    && (!filters.date || entry.at.slice(0, 10) === filters.date)
    && (!filters.questionId || entry.questionId.toLowerCase().includes(filters.questionId.toLowerCase()))
    && (!filters.reportId || entry.reportIds.some((id) => id.toLowerCase().includes(filters.reportId.toLowerCase()))));
}
