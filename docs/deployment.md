# Deployment

## Production deployment

- **Live URL:** https://acadza-question-intelligence.vercel.app
- **Production deployment URL:** https://acadza-question-intelligence-gpjaztbgo-hiten41s-projects.vercel.app
- **Repository:** https://github.com/Hiten41/acadza-question-intelligence
- **Vercel project:** `hiten41s-projects/acadza-question-intelligence` (existing Hobby project)
- **Production deployment ID:** `dpl_GRSS2r9pezg6twymZB3g53inTzC8`
- **Status:** Ready; deployed and verified on 11 November 2026 (Asia/Kolkata).
- **Public access:** An unauthenticated request to the production alias returned HTTP 200.

The project uses the existing Vite configuration: framework preset `Vite`, install command `npm ci`, build command `npm run build`, and output directory `dist`. `vercel.json` contains the build and output settings.

## Verification

The release checks passed on the final source snapshot:

- `npm ci` — dependencies installed; 0 reported vulnerabilities.
- `npm run lint` — passed.
- `npm test` — 27 tests across 4 files passed.
- `npm run results` — generated exactly 44 report-level results from 43 source questions (11 safe auto candidates and 19 faculty reviews).
- `npm run build` — TypeScript and Vite production build passed.
- `npm audit` — 0 vulnerabilities.
- Chromium browser walkthrough — 36 checks passed on the public production alias with no uncaught browser or console errors. Checks covered overview counts and charts, global search, grouped R001 reports, the exact C-to-A mathematical change, confirmed local staging, persistence across refresh, proactive findings, the R034 faculty gate, staged decisions, audit history and JSON export, confirmed reset, mobile navigation and case detail, sidebar collapse, compact section headings, and seven viewport widths (360, 390, 768, 1024, 1280, 1440, and 1920 pixels) without horizontal overflow.
- The public alias returned HTTP 200 after deployment. The production URL and screenshots were verified against deployment `dpl_GRSS2r9pezg6twymZB3g53inTzC8`.

`results.json` SHA-256 remained `15BF7DE3476512C540F47CA943B3185F7AFAC62F86CD72B01245E942E8E31901`, and `bonus_findings.json` SHA-256 remained `06E593FE6510606341B3BB370703C0617D9EFFC98B79553FB74AB6D790CC215E` after regeneration. Genuine screenshots captured from this public production deployment are in [`screenshots/deployed/`](../screenshots/deployed/).

## Scope and limitations

The deployment is a static demonstration of the supplied offline adjudications. It does not call a live LLM, connect to Acadza production, or write corrections to a question bank. Decisions, reply previews, and audit entries are stored only in the visitor's browser local storage; clearing browser data removes them. The audit JSON export is a local download, not a server audit record.

The deployed assignment data is the same snapshot already present in the public repository. No additional private data or credentials were added to the deployment.
