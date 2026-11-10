# Data dictionary

## Source JSON

| File | Contents | Important fields |
| --- | --- | --- |
| `data/questions.json` | 43 source question records | `_id`, `qid`, `questionType`, `subject`, `chapter`, `concept`, `subConcept`, `level`, `error`, `updatedAt`, nested question content, `errorHistory` |
| `data/reports.json` | 44 sanitized student reports | `reportId`, `questionId`, `source`, `reportedAt`, `comment`; `studentId` is intentionally removed from the delivered copy |
| `data/taxonomy.json` | Closed classification and repair permissions | `verdicts`, `repairs[repair].fields`, `repairs[repair].auto`, labels |
| `data/adjudications.json` | One researched offline decision per report | verdict, repair, optional surgical edit, route gate, confidence, evidence, student reply |

The question's payload is stored under the key matching `questionType` (`scq`, `mcq`, or `integerQuestion`). That payload may include `question`, `solution`, `answer`, `quesImages`, and `solutionImages`. HTML/MathML fields are strings. Answers may be strings or arrays; consumers must not coerce arrays to strings before validation.

## Generated result record

`results.json` contains exactly 44 entries and uses the assignment's public record contract:

| Key | Meaning |
| --- | --- |
| `reportId` | Original report identifier |
| `questionId` | Exact question `_id` referenced by that report |
| `verdict` | One of the seven taxonomy verdicts |
| `repair` | One of the 18 taxonomy repair types, or `null` |
| `edit` | Optional `{field, find, replace}` surgical patch |
| `route` | `auto_apply`, `faculty_review`, or `no_change` |
| `confidence` | Internal decision score from 0 to 1; not calibrated probability |
| `evidence` | Concise rationale stored with the reviewed decision |
| `student_reply` | One-to-three-sentence response preview |

Generator validation details are in `scripts/generate-results.mjs`. Each result has exactly the nine public keys above, including `edit: null` when no edit is proposed; the output does not include student IDs. The UI derives its validation checklist from the loaded question, taxonomy scope, and route rather than adding internal keys to the result contract.

## Grouping and privacy

There are 39 unique `questionId` values among 44 reports. Grouping retains report rows, comments, sources, timestamps, and report IDs. It does not combine unrelated cases by text similarity. Student IDs are absent from the delivered `reports.json`, generated results, UI, and local audit model.

## Browser state

The app stores a versioned local-storage object with `decisions`, `audit`, and `studentReplies`. It is per browser profile and is not an authoritative or durable data store.
