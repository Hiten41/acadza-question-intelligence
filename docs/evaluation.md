# Evaluation

## Method

The supplied archive has no official labels or adjudicator ground truth. The decisions in `data/adjudications.json` are a manual, case-by-case evidence review informed by the supplied case anchors and source question/solution data. They are **independent working findings**, not benchmark labels or measured model performance. No LLM was called.

The generator validates report coverage, unique identifiers, question joins, allowed verdict and repair values, explicit route safety, conservative automatic-repair allowlisting, confidence thresholds, edit-field permissions, typed answers, and source-value matching. The tests cover dataset/output integrity, route derivation and unsafe explicit-route attempts, review queue helpers, edited proposal validation, local state handling, and audit filters. See [testing report](testing-report.md) for exact current command results.

## Report-level results

`results.json` contains exactly one result for each of the 44 individual reports:

| Measure | Reports |
| --- | ---: |
| Total reports | 44 |
| Distinct question cases referenced | 39 |
| `defect` | 24 |
| `no_error` | 9 |
| `display_issue` | 4 |
| `app_issue` | 2 |
| `language_mode` | 1 |
| `already_fixed` | 1 |
| `not_actionable` | 3 |
| `auto_apply` | 11 |
| `faculty_review` | 19 |
| `no_change` | 14 |

These counts are at the report level, so repeated reports each have their own result and route.

## Grouped question-case routes

The application groups reports by their shared question `_id`, but keeps each report result and its adjudication visible. A grouped case uses its most conservative route when linked reports differ: `faculty_review` takes precedence, then `auto_apply`, then `no_change`.

| Grouped case route | Question cases |
| --- | ---: |
| Safe correction candidate | 9 |
| Faculty review required | 16 |
| No content change | 14 |
| **Total** | **39** |

Thus, 11 report-level `auto_apply` entries correspond to 9 safe question cases, and 19 report-level `faculty_review` entries correspond to 16 faculty-review cases. This grouping affects queue counts only; all 44 report results remain in `results.json`.

## Reviewed edge cases

- Answer keys R001–R005 were checked against the solution arithmetic or stated physical relation; the demo only stages permitted edits and retains the source.
- R006–R008 raise missing-stem-data questions; insufficient evidence is routed to a person.
- R009–R010 do not invent unrecoverable option text. R011's blank option is handled as a bounded option repair.
- R015 identical options, R021 type/answer representation, R025 missing figure, R026 syllabus, R034 unsound question, and chapter corrections remain faculty-only.
- R017 is not changed because the reported typo is absent. R020's scoring complaint does not justify changing the content key. R027's instruction-like text is treated as untrusted comment text. R028–R033 and R043–R044 are handled as student misunderstandings where supported by the stored derivation.
- R035's answer-key complaint is separate from a factual error in the explanation; that additional finding is recorded in `bonus_findings.json` and requires faculty approval.
- Four no-report questions were inspected. No additional defect was confirmed in those four records; their identifiers are listed in the bonus file.

## False positives, false negatives, and limits

There is no official label set, so a confusion matrix, precision, recall, false-positive rate, or false-negative rate would be invented. The manual review may still miss subtle errors. Confidence values are internal scores and are not calibrated. The result generator validates structure and safety rules, not the truth of every proof. The static adjudication set does not classify unseen reports.

## Safety results

The generator refuses unknown taxonomy entries, missing joins, edits outside declared fields, stale source values, invalid explicit automatic routes, human-only automatic repairs, low-confidence automatic routes, and answer-type coercion. Automatic staging is limited to a conservative allowlist and additionally requires `defect`, taxonomy permission, a valid source-matching edit, confidence of at least 0.95, and no manual-review override. A formal model red-team evaluation and production concurrency testing remain future work because this build has no runtime model, backend, or production data path.
