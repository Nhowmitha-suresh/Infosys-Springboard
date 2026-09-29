# Integrated Frontend Update V3 — Team-C & Team-D

Team-C and Team-D's complete frontend (from "Healthcare Management Platform for
Clinical Operation") is now embedded in the main MediSphere app, the same way
Team-B's UI is embedded.

## What was done

- Team-C/D's static unified-dashboard build (`backend/src/main/resources/static/`
  from their project — `index.html` + `modules/` which already contains both
  Team-C's own modules `m1`–`m4` and Team-D's modules under `modules/d/`) was
  copied as-is into:

  `public/team-c/`

- A new page, `src/pages/TeamCUI.tsx`, renders it full-height inside an
  `<iframe src="/team-c/index.html">`.
- A route was added: `#/team-c-ui`.
- A sidebar entry **"Team-C & D Complete UI"** was added (visible to every
  role, same as the other cross-team screens).
- Access control in `Layout.tsx` was updated to allow `/team-c-ui` for all
  roles.

No files inside the copied `public/team-c/` were modified — the module pages
already contain an `_iframe-fix.js` that hides their own sidebar/topbar when
loaded inside another page's iframe, so they render cleanly inside the main
shell without any patching.

## Important runtime note

Just like the Team-B embed, this is a **UI-only embed**. The Team-C/D module
pages call their own backend via relative paths (e.g. `/api/...`,
`/api/d/...`). For those calls to return live data, the Team-C/D Spring Boot
backend (`backend/` in the "Healthcare Management Platform for Clinical
Operation" project, default port `8080`) must be running and reachable at the
same origin the pages are served from — otherwise the module pages will show
"No result available" placeholders, which is expected without the backend up.

## How to open it

Run the main app as usual (`npm run dev` / `npm run build`), log in, and pick
**Team-C & D Complete UI** from the left sidebar.

## Verified

- `npm run build` (vite) completes cleanly with the new page/route/sidebar
  changes — 0 build errors introduced.
- `dist/team-c/` is produced correctly alongside the existing `dist/team-b/`.
