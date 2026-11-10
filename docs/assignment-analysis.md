# Assignment and dataset analysis

## Dataset inspected

The original assignment ZIP and its README were inspected before implementation. The archive contains three JSON datasets: questions, reports, and taxonomy.

- 43 question records: 31 SCQ, 2 MCQ, 10 integer questions.
- 44 report records with 39 distinct `questionId` values.
- Four repeated-report groups: R001–R003; R007–R008; R009–R010; R018–R019. These are five extra reports beyond one per question case.
- Four question records have no associated reports; their IDs and audit outcome are recorded in `bonus_findings.json`.
- Seven verdict keys and 18 repair keys are defined by `data/taxonomy.json`.

Reports join to question records only by `reports[].questionId === questions[]._id`. `qid` is a display identifier, not the relation key. Question/solution HTML and inline MathML are retained. Answer values can be arrays as well as strings; the original array representation is preserved and the scope guard rejects unsafe string edits to an array answer. `studentId` is removed from the delivered copy of `data/reports.json`.

## Data quality observations

The supplied question data nests `question`, `solution`, `answer`, and image arrays under the object named by `questionType`. There are unusual MCQ answer arrays, historical correction metadata, missing/blank option cases, source markup, and student-reported platform issues. Repeated comments are not discarded. Question cases are grouped by exact database ID, while every report remains individually identifiable in the queue and `results.json`.

## Taxonomy

The exact allowed verdicts are `defect`, `no_error`, `display_issue`, `app_issue`, `language_mode`, `already_fixed`, and `not_actionable`.

The repair set is `spelling`, `noise`, `exam_reference`, `markup_leak`, `answer_form`, `notation`, `stem_data`, `option_repair`, `solution_fix`, `solution_missing`, `answer_key`, `type_mismatch`, `identical_options`, `diagram`, `wrong_question`, `unsound`, `wrong_chapter`, and `syllabus`. The machine-readable field permissions and `auto` flags in `data/taxonomy.json` are authoritative. Human-only repairs include identical options, diagram, wrong question, unsound, wrong chapter, and syllabus.

## Acceptance criteria and status

| Criterion | Status in this demo |
| --- | --- |
| Preserve all 44 report IDs and question IDs | Implemented and validated by result generator |
| Group by production `_id` without dropping repeated reports | Implemented |
| Exact closed taxonomy and field scope | Enforced during generation and checked in UI |
| Explain evidence and expose source question/solution/answer | Implemented with offline adjudications |
| Stage safe correction and require faculty review for uncertainty | Implemented as local browser review state |
| Preserve source content and sanitize HTML/MathML rendering | Implemented |
| AI provider abstraction and generalized runtime model pipeline | Not implemented; no provider key available, and no model call is claimed |
| Server-side durable audit and live Acadza update | Not implemented |
| Public repository/live deployment | Not created or verified |

## Technical plan used

Use a small Vite/React application for a reviewable static console; validate a closed, precomputed baseline against source JSON and taxonomy; group by `_id`; render original content safely; keep mutations local and explicitly staged. With no model configuration or backend, a static, reproducible baseline was safer and more honest than simulating an LLM or exposing credentials in the browser. Production follow-up needs a server-side investigation provider, persistent database, authentication/authorization, and a complete review audit.

## Security considerations

Comments are untrusted data. The R027 instruction-like comment does not control the adjudication. Imported HTML is sanitized with DOMPurify and scripts, frames, event-handler attributes, and embeds are forbidden. Student IDs are removed from the demo report copy. Original records are read-only in the UI. The app has no secrets, external inference call, or production write credentials.
