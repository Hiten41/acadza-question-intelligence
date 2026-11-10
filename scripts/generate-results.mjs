import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deriveSafeRoute, resolveSafeRoute } from "../src/lib/route-safety.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const write = (name, value) => fs.writeFileSync(path.join(root, name), JSON.stringify(value, null, 2) + "\n", "utf8");
const questions = read("data/questions.json");
const reports = read("data/reports.json");
const taxonomy = read("data/taxonomy.json");
const decisions = read("data/adjudications.json");
const byId = new Map(questions.map((q) => [q._id, q]));

if (questions.length !== 43 || reports.length !== 44) {
  throw new Error("Expected 43 questions and 44 reports; found " + questions.length + " and " + reports.length + ".");
}
if (new Set(reports.map((report) => report.reportId)).size !== reports.length) {
  throw new Error("Duplicate report IDs are not allowed.");
}
if (Object.keys(decisions).length !== reports.length) {
  throw new Error("Expected one adjudication per report; found " + Object.keys(decisions).length + " decisions.");
}

const results = reports.map((report) => {
  const decision = decisions[report.reportId];
  const question = byId.get(report.questionId);
  if (!question) throw new Error("Question _id not found for " + report.reportId + ".");
  if (!decision) throw new Error("No adjudication for " + report.reportId + ".");
  const repair = decision.repair;
  if (decision.verdict === "defect" && !repair) throw new Error("Defect " + report.reportId + " has no repair.");
  if (decision.verdict !== "defect" && repair) throw new Error("Non-defect " + report.reportId + " has a repair.");
  if (!taxonomy.verdicts[decision.verdict]) throw new Error("Unknown verdict on " + report.reportId + ".");
  const repairRule = repair ? taxonomy.repairs[repair] : null;
  if (repair && !repairRule) throw new Error("Unknown repair on " + report.reportId + ".");
  if (typeof decision.confidence !== "number" || !Number.isFinite(decision.confidence) || decision.confidence < 0 || decision.confidence > 1) {
    throw new Error("Confidence must be between 0 and 1 on " + report.reportId + ".");
  }
  const edit = decision.edit ? { ...decision.edit } : undefined;
  if (decision.edit && (!decision.edit || typeof decision.edit !== "object" || Array.isArray(decision.edit))) {
    throw new Error("Edit must be an object on " + report.reportId + ".");
  }
  if (edit && Object.keys(edit).some((key) => !["field", "find", "replace", "value"].includes(key))) {
    throw new Error("Unexpected edit property on " + report.reportId + ".");
  }
  if (edit && edit.replace !== undefined && edit.value !== undefined) {
    throw new Error("An edit cannot provide both replace and value on " + report.reportId + ".");
  }
  if (edit && typeof edit.field !== "string") throw new Error("Edit field is missing on " + report.reportId + ".");
  const content = question[question.questionType];
  if (edit && edit.replace !== undefined && edit.find === undefined) {
    edit.find = edit.field === "questionType" ? question.questionType : content?.[edit.field];
  }
  if (edit) {
    const fields = repairRule?.fields ?? [];
    if (!fields.includes(edit.field)) throw new Error("Repair " + repair + " may not edit " + edit.field + " on " + report.reportId + ".");
    if (edit.field === "questionType") {
      if (edit.find !== question.questionType) throw new Error("Type patch mismatch on " + report.reportId + ".");
      const replacement = edit.value ?? edit.replace;
      if (!["scq", "mcq", "integerQuestion"].includes(replacement)) throw new Error("Invalid question type replacement on " + report.reportId + ".");
    } else if (edit.field === "answer") {
      const source = content?.answer;
      const replacement = edit.value ?? edit.replace;
      if (Array.isArray(source)) {
        if (edit.find !== undefined && JSON.stringify(source) !== edit.find) throw new Error("Answer patch mismatch on " + report.reportId + ".");
        if (!Array.isArray(replacement) || replacement.length === 0 || replacement.some((value) => typeof value !== "string" || !value.trim())) {
          throw new Error("Array answer edits must preserve a non-empty string array on " + report.reportId + ".");
        }
      } else if (typeof source !== "string" || source !== edit.find || typeof replacement !== "string" || !replacement.trim()) {
        throw new Error("Answer patch must match the stored value and provide a non-empty string on " + report.reportId + ".");
      }
    } else {
      const source = content?.[edit.field];
      const replacement = edit.value ?? edit.replace;
      if (typeof source !== "string" || typeof edit.find !== "string" || !edit.find || !source.includes(edit.find)) {
        throw new Error("Source text for patch is missing on " + report.reportId + ".");
      }
      if (typeof replacement !== "string" || (!replacement.trim() && repair !== "exam_reference")) {
        throw new Error("Text replacement is invalid or empty on " + report.reportId + ".");
      }
    }
  }
  const derivedRoute = deriveSafeRoute({
    verdict: decision.verdict,
    repair,
    taxonomyAuto: repairRule?.auto === true,
    confidence: decision.confidence,
    hasValidEdit: !!edit,
    manualReview: decision.manualReview === true,
  });
  let route;
  try {
    route = resolveSafeRoute({ explicitRoute: decision.route, derivedRoute, verdict: decision.verdict });
  } catch (error) {
    throw new Error(`${error.message} on ${report.reportId}.`);
  }
  return {
    reportId: report.reportId,
    questionId: report.questionId,
    verdict: decision.verdict,
    repair: repair ?? null,
    edit: edit ?? null,
    route,
    confidence: decision.confidence,
    evidence: decision.evidence,
    student_reply: decision.student_reply,
  };
});

const outputKeys = ["reportId", "questionId", "verdict", "repair", "edit", "route", "confidence", "evidence", "student_reply"].sort();
for (const result of results) {
  if (JSON.stringify(Object.keys(result).sort()) !== JSON.stringify(outputKeys)) {
    throw new Error("Unexpected output schema for " + result.reportId + ".");
  }
  if (!taxonomy.verdicts[result.verdict] || (result.repair !== null && !taxonomy.repairs[result.repair])) {
    throw new Error("Invalid taxonomy value in output for " + result.reportId + ".");
  }
  if (typeof result.reportId !== "string" || typeof result.questionId !== "string" || typeof result.evidence !== "string" || typeof result.student_reply !== "string") {
    throw new Error("Required string field is missing for " + result.reportId + ".");
  }
  const sentenceCount = (result.student_reply.match(/[.!?](?=\s|$)/g) ?? []).length;
  if (!result.evidence.trim() || sentenceCount < 1 || sentenceCount > 3) {
    throw new Error("Evidence or student reply is missing/outside the 1-3 sentence limit for " + result.reportId + ".");
  }
  if (result.edit !== null && (!result.edit || typeof result.edit.field !== "string" || Object.keys(result.edit).some((key) => !["field", "find", "replace", "value"].includes(key)))) {
    throw new Error("Invalid edit shape for " + result.reportId + ".");
  }
}

const reportIds = new Set(reports.map((r) => r.reportId));
if (results.length !== reports.length || new Set(results.map((r) => r.reportId)).size !== results.length || results.some((r) => !reportIds.has(r.reportId))) {
  throw new Error("Output does not retain all source reports.");
}
const reportById = new Map(reports.map((report) => [report.reportId, report]));
if (results.some((result) => result.questionId !== reportById.get(result.reportId)?.questionId || "studentId" in result)) {
  throw new Error("Output has a report/question mismatch or contains a student identifier.");
}

write("results.json", results);
fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.copyFileSync(path.join(root, "results.json"), path.join(root, "public/results.json"));
console.log("Generated " + results.length + " results from " + questions.length + " questions; " + results.filter((r) => r.route === "auto_apply").length + " safe auto candidates, " + results.filter((r) => r.route === "faculty_review").length + " faculty reviews.");
