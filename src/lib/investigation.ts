import type {
  InvestigationResult,
  Question,
  Report,
  Route,
} from "./types";

export const normalizeComment = (comment: string) =>
  comment
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en");

export function groupReportsByQuestion(reports: Report[]) {
  return reports.reduce<Map<string, Report[]>>((groups, report) => {
    const current = groups.get(report.questionId) ?? [];
    current.push(report);
    groups.set(report.questionId, current);
    return groups;
  }, new Map());
}

export function findQuestion(questionId: string, questions: Question[]) {
  return questions.find((question) => question._id === questionId);
}

export function routeFor(verdict: InvestigationResult["verdict"], repair: InvestigationResult["repair"], autoAllowed: boolean, confidence: number, edit?: InvestigationResult["edit"]): Route {
  if (verdict === "no_error" || verdict === "already_fixed" || verdict === "not_actionable" || verdict === "language_mode") return "no_change";
  if (verdict === "defect" && repair && autoAllowed && confidence >= 0.95 && edit) return "auto_apply";
  return "faculty_review";
}

export function validateEditScope(
  result: InvestigationResult,
  question: Question,
  allowedFields: string[],
) {
  if (!result.edit) return { ok: true, reason: "No content mutation proposed." };
  if (!allowedFields.includes(result.edit.field)) {
    return { ok: false, reason: `Repair ${result.repair} cannot touch ${result.edit.field}.` };
  }
  const content = question[question.questionType];
  if (!content) return { ok: false, reason: "Question type has no matching content object." };
  if (result.edit.field === "answer") {
    const current = content.answer;
    if (Array.isArray(current)) return { ok: false, reason: "Array answer needs a reviewed type migration; no string edit is safe." };
    if (result.edit.find !== undefined && current !== result.edit.find) {
      return { ok: false, reason: "Answer patch does not match the current value." };
    }
    return { ok: true, reason: "Answer patch matches the current answer." };
  }
  if (result.edit.field === "questionType") {
    if (result.edit.find !== question.questionType) return { ok: false, reason: "Question type patch does not match the current type." };
    return { ok: true, reason: "Question type patch matches the current type." };
  }
  const current = content[result.edit.field];
  if (typeof current !== "string") return { ok: false, reason: `The ${result.edit.field} field is not text.` };
  if (result.edit.find && !current.includes(result.edit.find)) {
    return { ok: false, reason: `Patch text was not found in the current ${result.edit.field}.` };
  }
  return { ok: true, reason: "Patch is confined to an allowed text field." };
}

export function verifyInternalConsistency(question: Question) {
  const content = question[question.questionType];
  if (!content) return [{ label: "schema", outcome: "flagged" as const, detail: "Missing content object for declared type." }];
  const checks: Array<{ label: string; outcome: "passed" | "flagged" | "not_run"; detail: string }> = [
    {
      label: "join key",
      outcome: question._id ? "passed" : "flagged",
      detail: question._id ? "Report joined by the production _id." : "Question _id is missing.",
    },
    {
      label: "answer representation",
      outcome: content.answer === undefined || content.answer === null ? "flagged" : "passed",
      detail: Array.isArray(content.answer)
        ? `Answer preserved as an array (${content.answer.length} entries); no lossy coercion.`
        : `Answer preserved as ${typeof content.answer}.`,
    },
    {
      label: "question/solution",
      outcome: content.question && content.solution ? "passed" : "flagged",
      detail: content.question && content.solution ? "Source HTML and inline MathML retained." : "Question or solution content is missing.",
    },
  ];
  return checks;
}

export function calculatePriority(result: InvestigationResult, reportCount: number) {
  const urgency = result.verdict === "defect" ? 36 : result.verdict === "app_issue" || result.verdict === "display_issue" ? 18 : 0;
  const route = result.route === "faculty_review" ? 18 : result.route === "auto_apply" ? 8 : 0;
  const uncertainty = Math.round((1 - result.confidence) * 18);
  const repetition = Math.min(20, Math.max(0, reportCount - 1) * 7);
  return urgency + route + uncertainty + repetition;
}
