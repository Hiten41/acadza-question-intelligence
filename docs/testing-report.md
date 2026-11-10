# Testing report

**Final verification:** 10 November 2026

## Command results

| Command | Result |
| --- | --- |
| `npm ci` | Completed; 198 packages installed, 0 vulnerabilities reported by npm. |
| `npm run lint` | Passed. |
| `npm test` | Passed: 27 tests across 4 files. |
| `npm run results` | Generated exactly 44 report results from 43 questions: 11 safe auto candidates and 19 faculty reviews. |
| `npm run build` | Passed TypeScript (`tsc -b`) and Vite production build; 1,586 modules transformed. |
| `npm audit` | 0 vulnerabilities. |

## Data integrity

The source snapshot contains 43 questions, 44 reports, 39 affected question cases, and four repeated-report groups. Result generation validates report-to-question joins, allowed verdict and repair taxonomy, route constraints, safe-stage conditions, field scope, and source-value matching. The public result output has exactly 44 entries and the required schema. The question IDs, report IDs, and report-level adjudications were preserved during the redesign.

## Automated coverage

The Vitest suite covers dataset and output-schema invariants, grouped report preservation, search across report and source content, combined filters and priority ordering, inline exact-diff behavior, safe-route derivation, rejection of unsafe explicit routes, safe-auto repair allowlisting, edited proposal validation, human-only repair gating, answer-type preservation, local-storage migration/corruption/failure/reset behavior, audit snapshots and filters, and source MathML retention. Tests are unit/regression tests; they do not call an LLM or production service.

## Browser walkthrough

The running Vite app was exercised through the Codex browser automation bridge:

- Searched for R001 and confirmed R001, R002, and R003 remain individually visible with separate comments and adjudications. Verified the stored answer `C`, proposed answer `A`, exact comparison, and rendered MathML solution.
- Staged the R001–R003 safe correction through its confirmation dialog and checked that the local audit entry included the associated reports and before/after answer values.
- Edited the R024 proposal, confirmed the edit was recorded in local audit history, and verified that active markup was rejected by revalidation.
- Reviewed R034 and confirmed the faculty-required gate is presented as a human decision. Reviewed R035 as a no-content-change report and rejected it locally.
- Checked the audit history, mobile case selection/back navigation, safe demo-reset confirmation, and reset to zero local audit entries.
- Checked the browser console after these flows; no errors were reported.

Responsive checks used browser viewport widths 360, 390, 768, 1024, 1280, 1440, and 1920 pixels. At each width, the document had no horizontal overflow. The mobile navigation stayed within the viewport, the queue switched to a dedicated selected-case view, and the long R034 question ID wrapped without clipping at tablet widths.

## Limits

The browser walkthrough was manual and is not a committed Playwright end-to-end suite. Viewport checks are browser emulation rather than testing on physical devices. No formal WCAG audit, screen-reader session, production monitoring, concurrency test, calibrated evaluation, backend, or provider integration is included. The app remains an offline demonstration; see [safety](safety.md) and [architecture](architecture.md).
