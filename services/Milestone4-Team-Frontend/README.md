# MediSphere — Healthcare Management Platform (React Frontend)

React + Vite + Bootstrap frontend for the MediSphere healthcare management
platform, built to sit in front of a **Java (Spring Boot) REST API** backend.

## Roles supported
- **Admin** — full visibility: all patients, all appointments, system stats
- **Doctor** — their own patients and appointment schedule
- **Receptionist** — front-desk: register patients, book/manage appointments
- **Patient** — self-service: view/book their own appointments

## Design system
- **Type**: Space Grotesk (display/headings), Inter (body/UI), IBM Plex Mono (numbers, stats, IDs, timestamps) — the mono face is used deliberately everywhere data appears, giving stat tiles and tables a "clinical readout" feel.
- **Palette**: deep teal/ink (`#0a3a36`, `#16232b`) as the primary brand color, warm paper background (`#faf9f6`), coral (`#d95c4f`) reserved strictly for alerts/cancellations, amber (`#c98a2e`) for pending states.
- **Signature motif**: a hairline heartbeat-pulse line (echoing the logo mark) appears at the base of the sidebar and in the login/register visual panel.
- **Stat cards**: styled as "vitals readouts" — left accent bar + mono numeral, rather than generic icon-tile cards.
- **Status badges**: an indicator-dot + label instead of solid pill badges, closer to equipment status lights.

## Modules included (Phase 1)
- Authentication (login/register) with JWT-ready token handling
- Role-based dashboards with KPI stats
- Patient management (list, search, add, edit, delete)
- Appointment management (list, filter, book, edit, status updates, cancel)

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`.

### Demo login (mock mode)
The app ships with `VITE_USE_MOCK_DATA=true` in `.env.example`, so it's fully
usable without the backend running. Demo accounts:

| Role         | Email                     | Password       |
|--------------|---------------------------|----------------|
| Admin        | admin@medisphere.com      | admin123       |
| Doctor       | doctor@medisphere.com     | doctor123      |
| Patient      | patient@medisphere.com    | patient123     |
| Receptionist | reception@medisphere.com  | reception123   |

## Connecting to the Java backend

1. Set `VITE_USE_MOCK_DATA=false` in `.env`.
2. Set `VITE_API_BASE_URL` to your Spring Boot server, e.g. `http://localhost:8080/api`.
3. Implement the following REST contract (already documented as comments at
   the top of each file in `src/api/`):

```
POST   /api/auth/login              { email, password }        -> { token, user }
POST   /api/auth/register           { name, email, password }  -> { token, user }
GET    /api/auth/me                                             -> user

GET    /api/patients                                            -> Patient[]
GET    /api/patients/{id}                                       -> Patient
POST   /api/patients                                             -> Patient
PUT    /api/patients/{id}                                        -> Patient
DELETE /api/patients/{id}                                        -> 204

GET    /api/appointments                                        -> Appointment[]
POST   /api/appointments                                         -> Appointment
PUT    /api/appointments/{id}                                    -> Appointment
PATCH  /api/appointments/{id}/status  { status }                 -> Appointment
DELETE /api/appointments/{id}                                    -> 204

GET    /api/dashboard/summary?role=ADMIN|DOCTOR|PATIENT|RECEPTIONIST
       -> { totalPatients, todaysAppointments, activeDoctors, pendingApprovals,
            recentAppointments[], recentPatients[] }
```

`src/api/axiosClient.js` automatically attaches the JWT (`Bearer <token>`)
stored in `localStorage` under `ms_token` to every request, and redirects to
`/login` on a `401` response — matching a standard Spring Security + JWT
filter setup.

`user.role` returned by the backend must be one of:
`ADMIN`, `DOCTOR`, `PATIENT`, `RECEPTIONIST` (see `src/utils/roles.js`).

## Project structure

```
src/
  api/            axios client + service modules (auth, patients, appointments, dashboard)
  context/        AuthContext (current user, login/logout)
  components/
    layout/       Sidebar, Topbar, DashboardLayout (role-aware nav)
    common/       ProtectedRoute, StatCard, Badge, Modal, Loader, EmptyState
    patients/     PatientTable, PatientFormModal
    appointments/ AppointmentTable, AppointmentFormModal
  pages/
    auth/         Login, Register
    dashboard/     AdminDashboard, DoctorDashboard, PatientDashboard, ReceptionistDashboard
    patients/      PatientsPage (shared, role-aware)
    appointments/  AppointmentsPage (shared, role-aware)
  data/           mockData.js (sample data used in mock mode)
  utils/          roles.js, dateUtils.js
```

## Next phases (not yet built)
- Billing / payments module
- Pharmacy & inventory module
- Medical records upload (docs/scans) with file preview
- Notifications (email/SMS reminders)
