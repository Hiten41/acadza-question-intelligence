import { describe, expect, it } from "vitest";
import { calculatePriority, groupReportsByQuestion, normalizeComment, validateEditScope } from "./investigation";
import type { InvestigationResult, Question, Report } from "./types";

describe("report grouping", () => {
  it("keeps every report while grouping by the production question id", () => {
    const reports = [
      { reportId: "R1", questionId: "db-id", source: "web", reportedAt: "", comment: "" },
      { reportId: "R2", questionId: "db-id", source: "ios", reportedAt: "", comment: "" },
    ] satisfies Report[];
    expect(groupReportsByQuestion(reports).get("db-id")).toHaveLength(2);
    expect(groupReportsByQuestion(reports).has("qid")).toBe(false);
  });
});

describe("normalization and safety", () => {
  it("normalizes invisible spacing without changing the stored source comment", () => {
    expect(normalizeComment("  ANS\u200B  galat hai ")).toBe("ans galat hai");
  });

  it("blocks an edit outside the taxonomy repair scope", () => {
    const question = {
      _id: "q1",
      questionType: "scq",
      scq: { question: "<h3>text</h3>", solution: "<h3>work</h3>", answer: "A" },
    } as Question;
    const result = { repair: "answer_key", edit: { field: "question", find: "text", replace: "new" } } as InvestigationResult;
    expect(validateEditScope(result, question, ["answer", "solution"]).ok).toBe(false);
  });

  it("ranks repeated faculty-review defects ahead of isolated no-change reports", () => {
    const high = { verdict: "defect", route: "faculty_review", confidence: 0.88 } as InvestigationResult;
    const low = { verdict: "no_error", route: "no_change", confidence: 0.99 } as InvestigationResult;
    expect(calculatePriority(high, 3)).toBeGreaterThan(calculatePriority(low, 1));
  });
});
