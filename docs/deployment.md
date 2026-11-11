# Deployment status

## Latest verified production deployment

The authenticated Vercel CLI 65.14.0 deployment list was checked on 12 November 2026. The newest production deployment listed is still `dpl_GMkT9TWaDke4CDLGWYjURGpesbTG`; no newer production deployment appeared.

- **Live production alias:** https://acadza-question-intelligence.vercel.app
- **Deployment URL:** https://acadza-question-intelligence-fzkpjiisv-hiten41s-projects.vercel.app
- **Deployment ID:** `dpl_GMkT9TWaDke4CDLGWYjURGpesbTG`
- **Status and created time:** Ready; 11 November 2026 at 21:31 IST.
- **Vercel project:** `hiten41s-projects/acadza-question-intelligence` (existing Hobby project).
- **Repository:** https://github.com/Hiten41/acadza-question-intelligence
- **Public access:** The production alias returned HTTP 200 without authentication on 12 November 2026.

The project uses Vite, `npm ci`, `npm run build`, and the `dist` output directory. The existing Vercel configuration is in `vercel.json`.

## Latest recorded production verification

The latest production browser walkthrough is the 11 November run against `dpl_GMkT9TWaDke4CDLGWYjURGpesbTG`:

- **37 Chromium checks passed**, with no uncaught browser or console errors.
- Coverage included overview counts/charts, search, grouped R001 reports, the C-to-A mathematical comparison, local staging and persistence, proactive findings, the R034 faculty gate, staged decisions, audit history and JSON export, reset, mobile navigation, sidebar collapse, readable finding labels and expandable IDs, and seven viewport widths (360, 390, 768, 1024, 1280, 1440, and 1920 pixels) without horizontal overflow.
- The associated source release checks recorded `npm ci`, lint, all 27 tests, results generation (44 results from 43 questions), production build, and `npm audit` with 0 vulnerabilities.
- `results.json` SHA-256: `15BF7DE3476512C540F47CA943B3185F7AFAC62F86CD72B01245E942E8E31901`.
- `bonus_findings.json` SHA-256: `06E593FE6510606341B3BB370703C0617D9EFFC98B79553FB74AB6D790CC215E`.
- Ten genuine captures from the deployed application are under [`screenshots/deployed/`](../screenshots/deployed/).

## Deployment history

The check counts below belong to separate production walkthroughs. Only the last row is the latest deployment and current recorded count.

| Order | Production deployment ID | Recorded Chromium checks | Status |
| --- | --- | ---: | --- |
| Earlier verification | `dpl_2n4fzg3jytmJqdiRGobVYeV1ubAA` | 23 | Historical |
| Dark-mode release | `dpl_HnccR9bi8auX9DUpzFKap8wsRGEV` | 36 | Historical |
| Interface refinement | `dpl_5CcUm6D9JBrn2dCQFWvJfFb7eRv7` | 35 | Historical |
| Concise investigation headings | `dpl_GRSS2r9pezg6twymZB3g53inTzC8` | 36 | Historical |
| Readable finding references | `dpl_GMkT9TWaDke4CDLGWYjURGpesbTG` | **37** | **Latest verified** |

Earlier deployment IDs and counts remain in [the implementation log](implementation-log.md) as historical milestones. The initial 23-check result and later 35/36-check runs are not the current count.

## Scope and limitations

This is a static demonstration of the supplied pre-reviewed offline adjudications. It does not call a live LLM, connect to Acadza production, publish corrections, or create a server-side audit record. Decisions, approval/staging demonstrations, reply previews, and audit entries are stored only in each visitor's browser local storage and can be cleared.

The deployed assignment content is the same snapshot already present in the public repository. No additional private data or credentials were added to the deployment.
