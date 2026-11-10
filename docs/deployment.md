# Deployment

## Current status

The application builds as a static Vite site. No public GitHub repository, Vercel project, or live URL has been created or verified. GitHub CLI is authenticated, but a public push has not been made because permission to share the assignment's question text and anonymous student comments has not been confirmed. No Vercel CLI/account was available. The app has no secrets and requires no backend.

## Static hosting

`vercel.json` sets the build command to `npm run build` and output directory to `dist`. To deploy, push this folder to a repository that is safe to share, import it into Vercel, keep those build settings, and deploy. A Netlify static build can use `npm run build` and `dist` as the publish directory. After deployment, open the URL and exercise the queue, a local decision, audit export, and reset before sharing it.

## Data-sharing gate

Before making a repository public, confirm that the assignment permits sharing the supplied question bank, solution text, student comments, timestamps, and report IDs. Student IDs were removed from `data/reports.json`, and no email address or long phone-number pattern was found in its comments; the remaining text is still assignment data. Do not publish the original ZIP or any private credentials.

## Persistence caveat

Static hosting will not make decisions durable or shared; review state stays in each browser's local storage. A real deployment must add authentication, server-side persistence, authorization, append-only audit history, concurrency control, retention rules, and a reviewed publish/revert path before faculty can rely on it.
