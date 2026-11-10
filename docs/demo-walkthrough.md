# Demo walkthrough

Start the local app with `npm run dev`; Vite normally serves `http://127.0.0.1:5173/`.

1. **Overview:** review the actual totals: 43 source questions, 44 student reports, and 39 grouped question cases. The remaining counts are derived from offline results and browser-local review state.
2. **R001–R003 LCR case:** open Review Queue and search `R001`. Inspect the individual comments and adjudications, open Solution, then Answer & history. The stored key is C; the proposal is A based on the supplied solution. Use the before/after panel and stage the correction after confirming. This only records a browser-local action.
3. **Edited proposal validation:** open an auto-routed proposal, edit it, and save. A faculty edit is checked again against its source, allowed taxonomy field, value type, active markup policy, route and staging threshold.
4. **Faculty gate:** filter to Faculty review and choose a correctable case such as R034 if it has a proposed field change. Review the required human gate and confirmation dialog. Cases with human-only repair categories expose further review rather than a correction-approval action.
5. **No-error and non-content cases:** filter Verdict to No content error or select an app/display/language case. The individual report's stored evidence remains visible; mark the no-change case reviewed or reject a report. No correction action is offered when there is no content proposal.
6. **Proactive Findings:** these notes are sourced from `bonus_findings.json` and kept separate from the 44 report adjudications.
7. **Audit History:** inspect the local action, expand it to see status transitions and before/after snapshots, filter by report/question/date/action, and export the audit JSON.
8. **Reset:** choose Reset demo, inspect the confirmation, and clear the browser-local decisions and audit. The read-only assignment data remains unchanged.

At mobile width, open a case from the list, use **All cases** to return, and navigate the sections from the horizontal mobile navigation. `Ctrl+K` / `Cmd+K` focuses queue search; `Escape` clears search or exits mobile detail.

The app does not call a live LLM, connect to Acadza production, publish content, or send the reply preview.
