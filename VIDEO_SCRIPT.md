# Three-minute demo script

**Recording status:** script prepared; no video recording has been created.

**Production demo:** https://acadza-question-intelligence.vercel.app

## 0:00–0:15 — Overview

**Screen:** Overview dashboard.

**Say:** “A student report can point to a content defect, a misunderstanding, or an app issue. Acadza Question Intelligence keeps each report connected to its source question and evidence. This build-round demo uses the supplied assignment snapshot and pre-reviewed offline decisions.”

**Transition:** Open **Review Queue** and search for `R001`.

## 0:15–0:40 — Queue and grouped reports

**Screen:** Review Queue with the R001 case and its three linked reports.

**Say:** “The dataset contains 44 reports grouped into 39 question cases. Here, three reports describe the same LCR question. The queue preserves each original report while presenting the shared case together.”

**Transition:** Select an individual report, then open **Answer & history**.

## 0:40–1:05 — Investigation and mathematical comparison

**Screen:** R001 investigation, source question, and before/after panel.

**Say:** “The phasor sum is the square root of 40 squared plus 30 squared, which is 50 volts. The supplied solution agrees with option A, while the stored answer key is C. The proposed patch changes only the answer field.”

**Transition:** Choose **Stage safe correction** to show the explicit confirmation and safety checks.

## 1:05–1:30 — Safe local staging

**Screen:** Staging confirmation, then **Approved / Staged Changes**.

**Say:** “The source question stays unchanged. Staging records a browser-local review action after the safety checks pass. It does not publish a correction or write to Acadza.”

**Transition:** Return to the queue and search for `R034`.

## 1:30–1:55 — Faculty review gate

**Screen:** R034 case and approval confirmation dialog.

**Say:** “This assertion/reason record proposes C, but its supplied solution is internally inconsistent. The case requires a human gate and does not offer the safe-stage action. A faculty approval opens its own confirmation; I’ll cancel here to leave the example pending.”

**Transition:** Close the dialog and open **Proactive Findings**.

## 1:55–2:10 — Separate findings

**Screen:** Proactive Findings.

**Say:** “These independent notes come from the bonus findings file. The interface keeps them separate from student-reported defects.”

**Transition:** Return to the queue and search `R017`, then `R038`.

## 2:10–2:30 — Non-content reports

**Screen:** R017, then R038.

**Say:** “R017’s spelling report is already addressed in the current question record, so no content edit is proposed. R038 describes a selected answer being saved differently; that is routed as an app issue, with no question-bank correction.”

**Transition:** Open **Approved / Staged Changes**, then **Audit History**.

## 2:30–2:50 — Audit trail and export

**Screen:** Staged list, Audit History entry, and Export JSON control.

**Say:** “The reviewer can inspect the staged action, its before and after values, and the local audit entry. Export JSON downloads this browser’s history; it is not a server-backed audit log.”

**Transition:** Use **Reset demo** and confirm.

## 2:50–3:00 — Close

**Screen:** The cleared Audit History view after the reset confirmation.

**Say:** “Reset clears only this browser’s review state. The source assignment data stays read-only. This prototype demonstrates the review workflow; it is not live AI or an Acadza production integration.”

## Recording preparation

1. Open the production URL above in Chrome. Use a fresh browser profile, or choose **Reset demo** and confirm before recording.
2. Set the browser to a desktop viewport, then follow the screen sequence and timings above. Keep browser zoom at 100% and close unrelated tabs or notifications.
3. On Windows, press **Win+Alt+R** to start and stop Xbox Game Bar recording. Use **Win+G** to check capture and microphone settings first; Game Bar normally saves recordings in `Videos\Captures`. Alternatively, use OBS to capture the browser window at 1920 × 1080 and record narration with a microphone.
4. Review the actual video and audio before sharing it. No recording link should be added until a video has genuinely been recorded and uploaded.
