# Safety and review policy

## Offline and read-only boundary

- The supplied question, report, adjudication, taxonomy, and result records remain unchanged by UI actions.
- The interface identifies its data as a **REVIEWED OFFLINE BASELINE**. It makes no live LLM call and does not connect to Acadza production.
- “Stage safe correction” records a browser-local decision only. It never publishes or writes to the Acadza question bank.
- Browser decisions and audit entries are local to the current profile and can be changed or cleared; they are not an append-only server audit.

## Central correction eligibility

Before a safe correction can be staged, the shared eligibility check verifies the repair key and permitted field against the official 18-repair taxonomy, validates that the original field still matches, checks the replacement's content and type, requires a content defect on the auto route, enforces the 95% offline score threshold, disallows human-only repairs, and checks for missing source content. The score is uncalibrated and is not a probability.

Faculty-edited values are passed through the same checks again before save and before the final correction action. Answer values keep their original scalar or array type. Empty values, changed source values, invalid answer types, unsupported fields, and active markup such as script tags or event handlers fail closed.

Faculty review is shown as a **required human gate**, not as a failed automated check. Human-only repairs, including `identical_options`, `diagram`, `wrong_question`, `unsound`, `wrong_chapter`, and `syllabus`, do not expose an automatic correction action. Content-changing decisions require a confirmation dialog showing the before/after values.

## Content and untrusted reports

- Question/solution HTML and MathML are sanitized with DOMPurify before display. The app retains the source values and does not write rendered values back to JSON.
- Source images are rendered separately with an unavailable-image fallback.
- Student comments are untrusted evidence; they are never executed as instructions or submitted to a model.
- Student identifiers are omitted from the delivered report copy.

## Local audit and recovery

Local entries can record a unique ID, timestamp, faculty label, question and report IDs, previous/new status, previous/new proposal, reason, field, and before/after values. The UI supports filters and JSON export. It does not claim server durability, authenticated identity, tamper resistance, or production rollback.

Storage loading handles missing, malformed, unsupported-version, and legacy state. A blocked browser write produces a warning; a confirmed reset clears both current and legacy demo state. Source assignment files are not part of reset behavior.
