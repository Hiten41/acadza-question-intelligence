export type SafeRoute = "auto_apply" | "faculty_review" | "no_change";
export const SAFE_AUTO_REPAIRS: readonly string[];
export function isSafeAutoRepair(repair: string | null | undefined): boolean;
export function deriveSafeRoute(input: {
  verdict: string;
  repair: string | null | undefined;
  taxonomyAuto: boolean;
  confidence: number;
  hasValidEdit: boolean;
  manualReview: boolean;
}): SafeRoute;
export function resolveSafeRoute(input: {
  explicitRoute?: SafeRoute | null;
  derivedRoute: SafeRoute;
  verdict: string;
}): SafeRoute;
