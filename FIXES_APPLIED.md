# Fixes Applied — 2026-07-02

Your project folder now contains the complete, fixed copy of the app. Build verified locally (compiles clean; bundle contains xlsx 0.20.3, no Anthropic references, worker chunk intact).

## Changed files

| File | Change | Audit ref |
|---|---|---|
| `package-lock.json` | Regenerated — xlsx now locks to **0.20.3** (SheetJS CDN) instead of vulnerable 0.18.5; `npm ci` is now safe | H1 |
| `src/fpWorker.js` | Deleted dead `aiMapSheet()` with its in-browser Anthropic API call (28 lines) | H2 |
| `src/App.jsx` | `ingestFile`: added try/catch so a failed file read no longer hangs the UI; fixed worker handoff to clone once + transfer (was making a pointless extra full-file copy) | L1, L2 |
| `package.json` | Removed unused `jsdom` dependency | M5 (partial) |
| `README.md` | Corrected 4 stale claims: AI panel → local keyword scoring; xlsx 0.18.x → 0.20.3; localStorage → IndexedDB | M1 |
| `vercel.json` | **New** — CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy + explicit CRA framework preset | M4 |
| `.gitignore` | **New** — node_modules, build, .env, .vercel | L6 |

## To deploy

Push everything in this folder to `main` of `voquocsibk2013/env_demo` (replacing existing files) — Vercel auto-deploys. If you use the GitHub web UI, drag-and-drop the files/folders directly so names aren't mangled (past commits show `INDEX~1.HTM`-style renames that once broke a deploy).

After deploying, spot-check: the site loads, an .xlsx upload parses, and `curl -sI https://env-demo.vercel.app | grep -i content-security` shows the new header.

## Not done (larger refactors, from the audit)

- M2: extract the duplicated calc engine (App.jsx + fpWorker.js) into a shared module
- M3: split the 6,952-line App.jsx
- M5: migrate CRA → Vite
