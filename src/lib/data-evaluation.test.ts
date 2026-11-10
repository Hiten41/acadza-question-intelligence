import { describe, expect, it } from "vitest";
import questions from "../../data/questions.json";
import reports from "../../data/reports.json";
import taxonomy from "../../data/taxonomy.json";
import results from "../../results.json";
import bonus from "../../bonus_findings.json";
import type { InvestigationResult, Question, Report } from "./types";
import { isSafeAutoRepair } from "./route-safety.mjs";

const questionRows = questions as Question[];
const reportRows = reports as Report[];
const resultRows = results as InvestigationResult[];
const byQuestionId = new Map(questionRows.map((question) => [question._id, question]));
const byReportId = new Map(reportRows.map((report) => [report.reportId, report]));

describe("assignment dataset regression", () => {
  it("retains the full dataset and joins every report to the production _id", () => {
    expect(questionRows).toHaveLength(43);
    expect(reportRows).toHaveLength(44);
    expect(new Set(reportRows.map((report) => report.questionId)).size).toBe(39);
    expect(new Set(reportRows.map((report) => report.reportId)).size).toBe(reportRows.length);
    expect(questionRows.filter((question) => question.questionType === "scq")).toHaveLength(31);
    expect(questionRows.filter((question) => question.questionType === "mcq")).toHaveLength(2);
    expect(questionRows.filter((question) => question.questionType === "integerQuestion")).toHaveLength(10);
    expect(reportRows.every((report) => byQuestionId.has(report.questionId))).toBe(true);
    expect(reportRows.every((report) => !("studentId" in report))).toBe(true);
    expect([...byQuestionId.values()].every((question) => {
      const content = question[question.questionType];
      return content?.answer === undefined || typeof content.answer === "string" || Array.isArray(content.answer);
    })).toBe(true);
  });

  it("emits exactly one strict result object per report with the assignment schema", () => {
    const keys = ["confidence", "edit", "evidence", "questionId", "repair", "reportId", "route", "student_reply", "verdict"].sort();
    expect(resultRows).toHaveLength(reportRows.length);
    expect(new Set(resultRows.map((result) => result.reportId)).size).toBe(reportRows.length);
    for (const result of resultRows) {
      expect(Object.keys(result).sort()).toEqual(keys);
      expect(byReportId.get(result.reportId)?.questionId).toBe(result.questionId);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      const sentenceCount = (result.student_reply.match(/[.!?](?=\s|$)/g) ?? []).length;
      expect(sentenceCount).toBeGreaterThanOrEqual(1);
      expect(sentenceCount).toBeLessThanOrEqual(3);
      expect(taxonomy.verdicts[result.verdict]).toBeDefined();
      if (result.repair) expect(taxonomy.repairs[result.repair]).toBeDefined();
    }
  });

  it("keeps every proposed edit within the taxonomy and source value", () => {
    for (const result of resultRows) {
      if (!result.edit || !result.repair) continue;
      const question = byQuestionId.get(result.questionId)!;
      const permissions = taxonomy.repairs[result.repair];
      expect(permissions.fields).toContain(result.edit.field);
      const content = question[question.questionType];
      if (result.edit.field === "questionType") {
        expect(result.edit.find).toBe(question.questionType);
      } else if (result.edit.field === "answer") {
        expect(Array.isArray(content?.answer)).toBe(false);
        expect(content?.answer).toBe(result.edit.find);
      } else {
        const value = content?.[result.edit.field];
        expect(typeof value).toBe("string");
        expect(value).toContain(result.edit.find);
      }
      if (result.route === "auto_apply") {
        expect(result.verdict).toBe("defect");
        expect(isSafeAutoRepair(result.repair)).toBe(true);
        expect(permissions.auto).toBe(true);
        expect(result.confidence).toBeGreaterThanOrEqual(0.95);
      }
    }
  });

  it("does not let the instruction-like student comment dictate an answer edit", () => {
    const injectionReport = reportRows.find((report) => /IGNORE ALL PREVIOUS INSTRUCTIONS/i.test(report.comment));
    expect(injectionReport).toBeDefined();
    const result = resultRows.find((entry) => entry.reportId === injectionReport?.reportId)!;
    expect(result.verdict).toBe("not_actionable");
    expect(result.repair).toBeNull();
    expect(result.edit).toBeNull();
    expect(result.route).toBe("no_change");
  });

  it("keeps the independent R035 solution finding separate from its answer-key complaint", () => {
    const r035 = resultRows.find((result) => result.reportId === "R035");
    const question = byQuestionId.get(r035!.questionId)!;
    const independent = bonus.independently_discovered_findings.find((finding) => finding.questionId === question._id);
    expect(r035?.verdict).toBe("no_error");
    expect(r035?.edit).toBeNull();
    expect(independent?.issueCategory).toBe("solution_fix");
    expect(independent?.requiredHumanAction).toMatch(/faculty/i);
    expect(bonus.unreported_questions_audited).toHaveLength(4);
  });
});
