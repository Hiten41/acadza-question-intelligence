# Design decisions

## Static, honest baseline

The assignment asks for an AI investigation workflow, but no model credential or server runtime was available. A browser-side fake provider would expose secrets and imply unsupported capability, so the build uses reviewed, per-report adjudications with an offline label and repeatable validation. The tradeoff is that the current engine does not generalize to new reports. A server-side provider abstraction is a production follow-up, not a claimed feature.

## Exact IDs and question-level queue

The report's `questionId` joins to the question `_id`; the visible `qid` is not stable enough to be the relation key. Grouping by the exact ID reduces duplicate faculty work while keeping all report IDs and original comments visible. Text-only similarity is not used to merge unrelated issues.

## Closed taxonomy and minimum patches

The taxonomy JSON is the permission source. The generator validates fields and source substrings before writing results. A small before/after view shows the field change while source content remains read-only. Ambiguous answer keys, missing values, unsound questions, option authoring, diagrams, and taxonomy-human-only repairs route to faculty.

## Review state in local storage

For a no-backend demo, local storage makes approve/edit/reject, reply-preview, audit, and reset interactions reproducible without external services. The cost is browser-local, non-durable state. A database and authenticated append-only audit are required before real faculty use.

## Priority heuristic

`calculatePriority` is intentionally understandable rather than presented as a learned risk score: content defects receive the strongest urgency; review routes and lower confidence add priority; repeated reports add capped weight. The queue sorts by this score, then recency. No average review time is shown because none is measured.

## Rendering and visual choices

Native HTML/MathML from the source is preserved and sanitized at render time instead of rewriting question markup into a second representation. The console uses a neutral editorial layout, compact queue cards, clear route pills, and an adjacent evidence/diff workspace so a tired reviewer can see the complaint and source context together. Decorative analytics and fake activity were omitted.

## What was not retained

No report-ID-specific branch was added to the general helper functions, but the supplied per-report offline adjudication file is necessarily specific to this assignment snapshot. It is not a generalized classifier. Proposed production ideas such as semantic deduplication, multi-provider orchestration, a database, and live deployment were not represented as working features.
