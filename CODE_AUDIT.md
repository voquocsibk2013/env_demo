# Code Audit — ENV·ASPECTS Toolkit (env_demo)

**Date:** 2026-07-02 · **Commit:** `17223ec` (main) · **Deployed:** env-demo.vercel.app (verified live during audit)

Scope: full source review (src/, public/, footprint_calculator.py), dependency audit, and verification against the production bundle.

---

## Summary

Client-side React (CRA) app for environmental risk screening and CO₂ footprint calculation. No backend, no secrets in the repo, all data stays in the browser (IndexedDB). The code is careful in the right places — HTML escaping in report export, quota-error handling, worker-based parsing. The two issues that need action are a **stale lockfile pinning a vulnerable xlsx version** and a **dead in-browser Anthropic API call** that must never be wired up as written.

| Severity | Count |
|---|---|
| High | 2 |
| Medium | 5 |
| Low | 6 |

---

## High

### H1. Lockfile pins vulnerable xlsx 0.18.5 — manifest says 0.20.3
`package.json` (deps + overrides) requests xlsx **0.20.3** from the SheetJS CDN, but the committed `package-lock.json` resolves xlsx **0.18.5** from the npm registry. 0.18.5 is vulnerable to prototype pollution (CVE-2023-30533) and ReDoS (CVE-2024-22363) — both triggered by parsing a crafted .xlsx, which is exactly what this app does with user files.

Verified: the production bundle ships 0.20.3 (Vercel's `npm install` re-resolved the mismatch). But any environment using `npm ci` — the reproducible path, and what CI systems default to — installs 0.18.5. Your build is only safe by accident.

**Fix:** delete `node_modules`, run `npm install`, confirm the lockfile now resolves xlsx to the CDN tarball, commit the lockfile.

### H2. In-browser Anthropic API call in fpWorker.js (dead code, unsafe by design)
`aiMapSheet()` (fpWorker.js:251) fetches `https://api.anthropic.com/v1/messages` directly from the browser. It is never called and would fail anyway (no `x-api-key`, no `anthropic-version`, CORS). The danger is that "fixing" it means embedding an API key in the client bundle, where anyone can extract it and bill your account.

**Fix:** delete the function. If AI mapping is wanted later, proxy through a serverless function (Vercel function keeping the key server-side). Note the README (line 73, 316) advertises this feature as live — see M1.

---

## Medium

### M1. README documents a feature that doesn't exist
README claims an "AI suggestion panel — sends a query to Claude Sonnet via the Anthropic API — direct browser fetch." The shipped code uses `localSuggestCOR()` (local keyword scoring, no API). Fix the docs; do not "fix" the code toward the README (see H2).

### M2. Triplicated business logic — drift risk
`COR_LOOKUP` (87 codes + emission factors), `FIELD_SCHEMAS`, `detectSheets`, `calcSheets`, and `localSuggestCOR` exist in both App.jsx and fpWorker.js, guarded only by a "keep in sync" comment. Verified currently identical — but a one-sided EF edit silently produces wrong emissions in either UI or export. `footprint_calculator.py` is a third, standalone implementation. **Fix:** extract a shared `corData.js` / `fpEngine.js` imported by both; move the Python prototype to `/legacy` or delete it.

### M3. App.jsx is a 6,952-line / 468 KB monolith
~50 components plus data tables, theming, and the calc engine in one file. It works, but every change carries collision risk and no piece is testable in isolation. Split at the obvious seams: data constants, theme, FootprintTab, ScreeningTab, WasteTab, ProjectView, PortfolioView.

### M4. No security headers beyond HSTS
Production serves no CSP, `X-Content-Type-Options`, or `frame-ancestors`. Low exploitability for a client-only app, but it's a 10-line `vercel.json` to add. Also set the framework preset while you're there (project currently has `framework: null`).

### M5. Deprecated stack: react-scripts 5.0.1 (CRA)
CRA is unmaintained. `npm audit`: 42 findings (19 high, 1 critical) — nearly all in dev-time tooling (webpack-dev-server/ws etc.), not shipped code, but the pile only grows. `jsdom` is a Node-only library unused anywhere in src — remove it (`ajv` can stay; it's a known CRA build workaround). Medium-term: migrate to Vite (mechanical for this codebase; the worker via `new URL(...)` already matches Vite's pattern).

---

## Low

- **L1 — Pointless buffer copy in worker handoff** (App.jsx:5541): `postMessage({buffer: buf}, [buf.slice(0)])` transfers a fresh copy that the message doesn't reference, so the real buffer is structured-cloned anyway — an extra full-file allocation per upload. Use `[buf]` and keep `wbRef` as the copy, or drop the transfer list.
- **L2 — `ingestFile` has no try/catch**: if `file.arrayBuffer()` rejects, `workerBusy` sticks at true and the UI hangs at "Reading file…".
- **L3 — Keydown effect re-subscribes every render** (no dep array, acknowledged in comment). Works; use refs for undo/redo handlers to make it clean.
- **L4 — `_fpRowCache` never evicts** — module-level Map grows per project opened in a session. Harmless at current scale.
- **L5 — Source maps public** (`main.*.js.map` → 200). Repo is public so nothing leaks today; set `GENERATE_SOURCEMAP=false` if the repo ever goes private.
- **L6 — Repo hygiene**: no `.gitignore`, no tests, no CI. Commit history shows DOS 8.3 mangled filenames (`INDEX~1.HTM`, `PACKAG~2.JSO`) from web-UI uploads — one deploy actually broke this way (`Delete public/index.html`, ERROR state). Use git CLI to push.

---

## What's done well

- Consistent `esc()` HTML-escaping in the report export — checked all user-controlled interpolations; no XSS path found, including via imported `.envproject` files.
- Import validation coerces types and strips oversized row arrays before persisting.
- IndexedDB storage with localStorage migration, debounced saves, and a visible "not saved" banner on quota failure (storage.js is clean).
- XLSX parsing in a Web Worker with progress reporting — UI stays responsive on big files.
- No secrets anywhere in repo or bundle; production domain public while preview aliases stay auth-protected.

## Priority order

1. Regenerate and commit `package-lock.json` (H1) — 5 minutes.
2. Delete `aiMapSheet()` and fix the README claim (H2, M1).
3. Add `vercel.json` with security headers + framework preset (M4).
4. Extract shared engine/data module from App.jsx/fpWorker.js (M2), then split App.jsx (M3).
5. Remove `jsdom`; plan CRA→Vite migration (M5).
