# Architecture

## Runtime shape

```text
questions.json ─┐
reports.json ────┼─> Vite static build ─> React faculty console ─> browser localStorage
taxonomy.json ──┤                              ▲
results.json ───┘                              │
bonus_findings.json ───────────────────────────┘

adjudications.json ─> deterministic validator/generator ─> results.json + public/results.json
```

The browser app is static. There is no API server, database, LLM provider, Acadza production connection, or publication path. Source JSON and pre-reviewed results are bundled at build time.

## Case and report model

`src/lib/review.ts` groups the 44 reports by exact `questionId` into 39 question cases. Each case retains all individual `InvestigationResult` records, with a separate aggregate verdict and conservative review route. The case list is ranked with `calculatePriority`: defect urgency, route, lower offline score, and repeat count. The score is a triage heuristic, not a probability or a measured severity scale. Case search reads all intended report and question content; filters combine without dropping linked report IDs.

The investigation view presents each original report and its own verdict, evidence, route, and proposal. It presents one case-level proposal for review while keeping the other report-level decisions traceable. Proactive findings from `bonus_findings.json` remain separate from `results.json`.

## Safety and actions

`actionEligibility` is the shared gate for safe staging and faculty approval. It validates the repair against the closed taxonomy, allowed field, current source value, replacement type and content, route, human-only policy, and confidence threshold for safe staging. Edited proposals pass through this gate again. Faculty review is represented as a required human gate, not a failed automated validation.

The source dataset remains immutable. Actions change only browser-local decision state and create a local audit snapshot. Content actions display a confirmation with the source and proposed value before recording. Reset clears only the demo's browser state after confirmation.

## Browser state

State is stored under `acadza-question-intelligence:v2` with a schema version. Missing data starts empty; malformed, unsupported-version, or inaccessible storage falls back to an empty in-memory state and surfaces a warning when a write fails. The loader can migrate the prior `v1` state and maps its “applied” action label to “staged”. A reset removes both local keys. This is not server-side persistence or an append-only audit log.

Audit entries can include ID, timestamp, actor label, question/report IDs, action, previous/new status and proposal, reason, field, and before/after snapshots. Audit filters can narrow by action, date, question ID, and report ID; export downloads a JSON snapshot.

## Content rendering

Question and solution HTML is sanitized with DOMPurify, using HTML and MathML profiles and blocking script-like tags and event attributes. Native MathML is retained. Images are shown from the supplied question record when available and have an offline fallback. The content tabs expose the original question, solution, answer/history, and source images without mutation.

## Deployment boundary

The Vite output can be hosted as a static demonstration. A production service would need authenticated ingestion, server-side structured validation, source-version checks, permissions, server audit retention, and a deliberate publication workflow. None of those production services are in this project.
