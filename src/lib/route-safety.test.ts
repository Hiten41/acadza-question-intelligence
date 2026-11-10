import { describe, expect, it } from "vitest";
import { deriveSafeRoute, resolveSafeRoute } from "./route-safety.mjs";

describe("derived route safety", () => {
  it("automatically stages only high-confidence defects in the conservative allowlist", () => {
    const derivedRoute = deriveSafeRoute({
      verdict: "defect", repair: "answer_key", taxonomyAuto: true, confidence: 0.95,
      hasValidEdit: true, manualReview: false,
    });
    expect(derivedRoute).toBe("auto_apply");
    expect(resolveSafeRoute({ explicitRoute: "auto_apply", derivedRoute, verdict: "defect" })).toBe("auto_apply");
  });

  it("rejects an explicit auto route that would bypass verdict, taxonomy, allowlist, score, edit, or human-review gates", () => {
    const unsafe = [
      { verdict: "no_error", repair: null, taxonomyAuto: false, confidence: 1, hasValidEdit: true, manualReview: false },
      { verdict: "defect", repair: "wrong_chapter", taxonomyAuto: false, confidence: 0.99, hasValidEdit: true, manualReview: false },
      { verdict: "defect", repair: "stem_data", taxonomyAuto: true, confidence: 0.99, hasValidEdit: true, manualReview: false },
      { verdict: "defect", repair: "answer_key", taxonomyAuto: true, confidence: 0.94, hasValidEdit: true, manualReview: false },
      { verdict: "defect", repair: "answer_key", taxonomyAuto: true, confidence: 0.99, hasValidEdit: false, manualReview: false },
      { verdict: "defect", repair: "answer_key", taxonomyAuto: true, confidence: 0.99, hasValidEdit: true, manualReview: true },
    ];
    for (const input of unsafe) {
      const derivedRoute = deriveSafeRoute(input);
      expect(derivedRoute).not.toBe("auto_apply");
      expect(() => resolveSafeRoute({ explicitRoute: "auto_apply", derivedRoute, verdict: input.verdict })).toThrow(/cannot bypass/i);
    }
  });

  it("does not route a content defect to no_change", () => {
    expect(() => resolveSafeRoute({ explicitRoute: "no_change", derivedRoute: "faculty_review", verdict: "defect" })).toThrow(/content defect/i);
  });

  it("keeps human-only repairs on the faculty route", () => {
    const derivedRoute = deriveSafeRoute({
      verdict: "defect", repair: "wrong_chapter", taxonomyAuto: false, confidence: 0.99,
      hasValidEdit: false, manualReview: false,
    });
    expect(derivedRoute).toBe("faculty_review");
    expect(resolveSafeRoute({ explicitRoute: "faculty_review", derivedRoute, verdict: "defect" })).toBe("faculty_review");
  });
});
