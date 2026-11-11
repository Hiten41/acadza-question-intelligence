# Demo walkthrough

Open the [public production demo](https://acadza-question-intelligence.vercel.app) in a fresh browser profile for a clean local review state. The demo stores review actions in browser local storage; **Reset demo** also clears that local state. The steps below were checked against the deployed application. The Overview uses compact assignment-derived summaries and charts; the queue pairs the case list with a technical investigation using concise section labels; Proactive Findings reads as a separate report with human-readable repair labels and optional technical record IDs; and Audit History presents browser-local actions chronologically.

1. **Overview:** check the supplied totals: 43 source questions, 44 student reports, 39 grouped question cases, 20 defect cases, 9 safe correction candidates, 16 faculty review cases, 25 cases with no content edit proposed, and 0 local reviews in a fresh profile.
2. **R001–R003 LCR case:** open **Review Queue** and search `R001`. The three original reports stay attached to one case. Open the individual report and the **Answer & history** source tab. The stored key is C; the proposal is A because the supplied phasor calculation gives 50 V. Compare the original and proposed values.
3. **Local staging:** choose **Stage safe correction**, review the before/after confirmation and safety summary, then choose **Stage locally**. This records a local action only; it does not change the source record. Refresh to confirm the local state persists, then open **Approved / Staged Changes**.
4. **Faculty gate:** search `R034`. The assertion/reason record proposes C while the supplied solution is internally inconsistent. Its route requires a human gate and does not offer the safe-stage action. **Approve proposed correction** opens a separate confirmation; any approval remains local to the browser.
5. **No-content and app issue cases:** search `R017` to see that the reported spelling issue is already fixed in the current record. Search `R038` to see a selection-recording issue routed as an app issue, with no question-content proposal.
6. **Proactive Findings:** open the section to review the independent notes from `bonus_findings.json`. They are labeled separately from student reports.
7. **Audit History and export:** return to **Approved / Staged Changes**, then open **Audit History**. Filter by report or question ID, expand the staged entry, and use **Export JSON** to download the browser-local history.
8. **Reset:** choose **Reset demo**, review the confirmation, and confirm the reset. The local decisions and audit entries clear; the supplied question and report data remain unchanged.

The submitted [three-minute highlight cut](https://github.com/Hiten41/acadza-question-intelligence/releases/download/acadza-demo-walkthrough-2026-11-11/Acadza-Question-Intelligence-Walkthrough-Trimmed.mp4) shows the Overview, the R001 mathematical investigation and local staging, the R034 faculty-review gate, Proactive Findings, a local R034 approval demonstration, staged changes, and Audit History. Its final audit view contains two browser-local actions: R001 staged and R034 approved. This is a demonstration action, not a real faculty decision or a production correction. The edited video does not show every step in this longer walkthrough.

At 390 × 844 mobile width, the queue search remains usable without page-level horizontal overflow. **All cases** returns from a mobile case detail view; `Ctrl+K` / `Cmd+K` focuses queue search and `Escape` clears search or exits mobile detail.

Local fallback: run `npm ci` and `npm run dev`, then open the Vite URL printed in the terminal, normally `http://127.0.0.1:5173/`.

The app does not call a live LLM, connect to Acadza production, publish content, or send the reply preview.
