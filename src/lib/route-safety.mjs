export const SAFE_AUTO_REPAIRS = Object.freeze([
  "answer_key",
  "spelling",
  "markup_leak",
  "exam_reference",
  "option_repair",
  "answer_form",
]);

export function isSafeAutoRepair(repair) {
  return SAFE_AUTO_REPAIRS.includes(repair);
}

export function deriveSafeRoute({ verdict, repair, taxonomyAuto, confidence, hasValidEdit, manualReview }) {
  if (["no_error", "already_fixed", "not_actionable", "language_mode"].includes(verdict)) return "no_change";
  if (verdict !== "defect") return "faculty_review";
  if (
    isSafeAutoRepair(repair)
    && taxonomyAuto === true
    && Number.isFinite(confidence)
    && confidence >= 0.95
    && hasValidEdit === true
    && manualReview !== true
  ) return "auto_apply";
  return "faculty_review";
}

export function resolveSafeRoute({ explicitRoute, derivedRoute, verdict }) {
  const route = explicitRoute ?? derivedRoute;
  if (!["auto_apply", "faculty_review", "no_change"].includes(route)) {
    throw new Error(`Unknown route: ${String(route)}.`);
  }
  if (route === "auto_apply" && (derivedRoute !== "auto_apply" || verdict !== "defect")) {
    throw new Error("An explicit auto_apply route cannot bypass the derived safety policy.");
  }
  if (verdict === "defect" && route === "no_change") {
    throw new Error("A content defect cannot be routed as no_change.");
  }
  if (verdict !== "defect" && route === "auto_apply") {
    throw new Error("Only a content defect may be routed for automatic staging.");
  }
  return route;
}
