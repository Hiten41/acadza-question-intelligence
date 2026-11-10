# Deployment

## Production deployment

- **Live URL:** https://acadza-question-intelligence.vercel.app
- **Repository:** https://github.com/Hiten41/acadza-question-intelligence
- **Vercel project:** `hiten41s-projects/acadza-question-intelligence` (Hobby)
- **Deployment ID:** `dpl_2n4fzg3jytmJqdiRGobVYeV1ubAA`
- **Status:** Ready; verified on 11 November 2026 (Asia/Kolkata).
- **Public access:** An unauthenticated request to the production alias returned HTTP 200.

The project uses the existing Vite configuration: framework preset `Vite`, install command `npm ci`, build command `npm run build`, and output directory `dist`. `vercel.json` contains the build and output settings.

## Verification

The pre-deployment checks passed:

- `npm ci`
- `npm run lint`
- `npm test` — 27 tests across 4 files
- `npm run results` — 44 report-level results generated from 43 source questions
- `npm run build`
- `npm audit` — 0 vulnerabilities

Both checked-in result files remained byte-for-byte unchanged after result generation. The production application was exercised in Chromium with 23 interaction and layout checks. These covered the displayed dashboard metrics, queue search, individual investigation, the R001 answer comparison and local staging, the R034 faculty gate, separate proactive findings, staged changes, audit history and JSON export, refresh persistence, confirmed demo reset, and a 390 × 844 mobile viewport with no horizontal overflow. No uncaught browser exceptions were observed.

Genuine production screenshots are in [`screenshots/deployed/`](../screenshots/deployed/).

## Scope and limitations

The deployment is a static demonstration of the supplied offline adjudications. It does not call a live LLM, connect to Acadza production, or write corrections to a question bank. Decisions, reply previews, and audit entries are stored only in the visitor's browser local storage; clearing browser data removes them. The audit JSON export is a local download, not a server audit record.

The deployed assignment data is the same snapshot already present in the public repository. No additional private data or credentials were added to the deployment.
