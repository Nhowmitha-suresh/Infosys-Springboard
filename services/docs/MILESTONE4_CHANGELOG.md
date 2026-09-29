# Milestone 4 integration — what changed

This documents exactly what was added on top of the Milestone 1–3 merged
project (`MediSphere-Healthcare-Platform-main.zip`) to bring in Milestone 4
("Precision Care Management") from `medisphere-integrated-platform.zip`,
whose frontend arrived as a static UI mockup with every number hardcoded
and no backend at all.

## Backend (`backend/`) — new

All under `com.medisphere.backend`, following the exact conventions of the
existing `CarePlan`/`Patient` vertical slice (Lombok `@Data` entities,
`JpaRepository`, constructor-injected `@Service`, thin `@RestController`,
`ResourceNotFoundException` → 404 via the existing `GlobalExceptionHandler`):

- **9 new entities** (tables prefixed `pc_`, created automatically by
  Hibernate — `ddl-auto=update`, same as every other table in this
  project): `PrecisionCarePlan`, `CarePlanGoal`, `OutcomeMetric`,
  `OutcomeTrendPoint`, `CareMilestone`, `ClinicalGuideline`,
  `CareTeamMember`, `CollaborationMessage`, `CollaborationTask`.
- **9 matching repositories.**
- **`PrecisionCareService`** — KPI aggregation (real averages/counts over
  the `pc_care_plans` table, not fabricated numbers) plus the care-plan,
  outcomes, guidelines, team, activity and task operations.
- **`PrecisionCareController`** — REST endpoints at `/api/precision-care/*`
  (full list in the root `README.md`'s API overview).
- **`SecurityConfig`** — one new block restricting all
  `/api/precision-care/**` mutating and reading calls to
  `ADMIN`/`DOCTOR`, matching how the ML console is gated.
- **`data.sql`** — seed rows for patient 102 (Arjun Verma, an existing
  Milestone 1 demo patient with Type 2 Diabetes) reproducing every number
  that used to be hardcoded in the mockup, so the page has real demo data
  out of the box.

Nothing under Milestone 1–3's existing backend code was modified except
`SecurityConfig.java` (one additive block) and `data.sql` (one additive
section at the end).

## Frontend (`frontend/`) — new

- `src/api/precisionCareService.js` — Axios client calls matching the new
  controller, following `carePlanService.js`'s pattern exactly.
- `src/components/precisioncare/` — `KpiCard`, `CareplanCard`,
  `OutcomeMeasurement`, `ProviderCollaboration`,
  `ClinicalGuidelineCompliance`. These are **rewrites** of the milestone-4
  mockup components: same visual design, but every hardcoded array is now
  `useState`/`useEffect` + a real fetch, with loading/error/empty states
  (reusing the existing `Loader`/`EmptyState` components) instead of
  assuming the data is always there. The CVD-risk trend chart is now
  built from real stored trend points instead of being a fixed SVG path.
  Guideline "Review now", care-plan "Approve"/"Send to patient", the
  message composer, and the task checkboxes all call real endpoints.
- `src/pages/precisioncare/PrecisionCarePage.jsx` — the page shell, now
  with a patient selector (reusing `patientService.getPatients()`)
  instead of being hardcoded to "John Doe", defaulting to patient 102.
- `src/styles/precision-care.css` — the mockup's stylesheet, copied
  as-is, plus a small appended block for the new patient selector, error
  banner, and task-list elements that didn't exist in the mockup.
- `App.jsx` / `Sidebar.jsx` — one new route (`/precision-care`) and one
  new sidebar link ("Precision Care"), gated to ADMIN/DOCTOR exactly like
  the ML console entries right above it.

## Not carried over

The mockup's own login screen, sidebar, and shell chrome (it shipped as a
fully standalone app) were **not** copied — this integration follows the
same rule the Milestone 1–3 merge used: one frontend, one auth system, one
shell, with each milestone contributing pages/components into it rather
than its own copy of the app frame.

## Verification status

This was built and reviewed statically in a sandbox with no Maven Central
or npm registry access (same limitation noted in the root `README.md` for
the original Milestone 1–3 merge) — it has **not** been compiled or run.
See "What could not be tested here" in the root `README.md` for exactly
what to check locally and how.
