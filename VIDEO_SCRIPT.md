# Three-minute demo script

**Recording status:** script prepared; no video recording has been created.

## 0:00–0:20 — Problem and product

“A student report can be a real answer-key defect, a misunderstanding, or an app issue. Acadza Question Intelligence puts the report beside the source question and evidence so a faculty reviewer can decide quickly. This is an offline build-round demo using the supplied dataset.”

## 0:20–0:45 — Dashboard and priority queue

Show the dashboard metrics and priority queue. “There are 44 report records grouped into 39 question cases. The repeated reports remain visible under the same question. Priority is a transparent heuristic based on defect severity, review route, confidence, and repetition.”

## 0:45–1:15 — Answer-key defect

Open R001–R003. “Three reports refer to the same LCR circuit. The stored solution computes 50 volts; that matches option A, while the record stores C. The queue keeps the three original reports attached to one case.”

## 1:15–1:45 — Patch and safety checks

Open the answer tab, then the proposed change and validation checklist. “The patch only changes the answer field and checks its source value against the taxonomy. The record is not overwritten; applying here records a local staging action in this browser.”

## 1:45–2:15 — Difficult faculty review

Open R034. “This assertion/reason question has no supported correct option as written. The system proposes no answer and requires a faculty decision. A missing diagram or syllabus claim follows the same human gate.”

## 2:15–2:40 — False report and non-content issue

Show R017, then R038. “R017's alleged spelling problem is not present in the current source, so the content stays unchanged. R038 reports that the app saved a different option; that belongs with platform behavior, not a question-bank edit.”

## 2:40–3:00 — Audit and impact

Record a local decision and open Audit history. “The reviewer can see which reports were handled, edit a student reply preview, and export the local audit. A production version needs server persistence and authenticated review. The purpose is to help students get reliable questions and close the loop on valid reports.”

## Recording preparation

No recording has been created. To reproduce the walkthrough:

1. In the project directory, run `npm ci`, then `npm run dev`, and open the Vite URL printed in the terminal (normally `http://127.0.0.1:5173/`).
2. Choose **Reset demo** in the footer and confirm so the browser-local audit and decisions start clean.
3. Follow the timed sections in order: **Overview** → **Review Queue**, search `R001`, inspect the grouped R001–R003 reports, choose the **Answer & history** source tab, then inspect the answer-key before/after panel → search `R034` and show its faculty gate → search `R017` and show its no-change decision → **Audit History** and record a local review action → describe the offline-only safety boundary.
4. For Xbox Game Bar, focus the browser window and press **Win+Alt+R** to start and again to stop recording. Review the capture and audio settings with **Win+G** before recording; the default capture folder is **Videos\Captures**. Alternatively, in OBS select the browser window as the capture source and record at 1920×1080.

The public repository does not contain a recording link. Add one only after an actual video has been recorded and uploaded by the user.
