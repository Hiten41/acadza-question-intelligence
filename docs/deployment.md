# Deployment

## Production deployment

- **Live URL:** https://acadza-question-intelligence.vercel.app
- **Repository:** https://github.com/Hiten41/acadza-question-intelligence
- **Vercel project:** `hiten41s-projects/acadza-question-intelligence` (Hobby)
- **Production deployment ID:** `dpl_HnccR9bi8auX9DUpzFKap8wsRGEV`
- **Status:** Ready; verified on 11 November 2026 (Asia/Kolkata).
- **Public access:** An unauthenticated request to the production alias returned HTTP 200.

The project uses the existing Vite configuration: framework preset `Vite`, install command `npm ci`, build command `npm run build`, and output directory `dist`. `vercel.json` contains the build and output settings.

## Verification

The production release checks passed:

- `npm ci`
- `npm run lint`
- `npm test` — 27 tests across 4 files
- `npm run results` — 44 report-level results generated from 43 source questions (11 safe auto candidates and 19 faculty reviews)
- `npm run build`
- `npm audit` — 0 vulnerabilities

Both `results.json` and `bonus_findings.json` retained their original SHA-256 hashes after result generation. The production application was exercised in Chromium with 36 passing browser checks and no uncaught browser or console errors. These covered the overview values and four data-derived charts, global search, R001 grouped reports and mathematical before/after values, confirmed local staging, persistence across refresh, proactive findings, the R034 faculty gate, audit history and JSON export, confirmed reset, mobile navigation and case detail, and desktop sidebar behavior. Layout checks at 360, 390, 768, 1024, 1280, 1440, and 1920 pixels found no horizontal overflow.

Genuine screenshots from the production deployment are in [`screenshots/deployed/`](../screenshots/deployed/).

## Scope and limitations

The deployment is a static demonstration of the supplied offline adjudications. It does not call a live LLM, connect to Acadza production, or write corrections to a question bank. Decisions, reply previews, and audit entries are stored only in the visitor's browser local storage; clearing browser data removes them. The audit JSON export is a local download, not a server audit record.

The deployed assignment data is the same snapshot already present in the public repository. No additional private data or credentials were added to the deployment.
