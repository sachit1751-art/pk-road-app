# PK Road App — Agent Handbook

## Purpose
PK Road App is built on top of an existing residential operations app nicknamed **ColonyHub**. It runs a single React SPA with hash-based routing that serves both:

- A **public website** for guests, on public routes only.
- An **authenticated role-based app** for residents, security, maintenance authorities, and RWA admins.

The public website should represent the real colony:
**Panchkuian Road Railway Colony, Railway Colony, Paharganj, New Delhi, Delhi 110055, India.**
See `src/public-colony-config.ts`.

## Tech stack
- React 19 + TypeScript
- Vite build/dev
- Tailwind CSS via `@tailwindcss/vite`
- Firebase app + auth + Firestore
- Express server for production serving and an API route
- AI issue classification via `@google/genai` in `api/classify-issue.ts`
- Lucide React icons
- Motion may be installed but is not a core UI dependency for the public site

Key files:
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `server.ts`
- `api/classify-issue.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/router/Router.tsx`
- `src/context/AppContext.tsx`
- `src/types.ts`
- `src/firebase.ts`
- `src/public-colony-config.ts`
- `src/data/seedData.ts`
- `firestore.rules`
- `firebase-applet-config.json`
- `firebase-blueprint.json`

## Project structure
- `/src`
  - `App.tsx` — app shell + public shell routing decision
  - `main.tsx` — entry point
  - `router/Router.tsx` — hash-based router, route params, role/public route checks
  - `context/AppContext.tsx` — global app state, auth, Firestore listeners, CRM-like operations
  - `types.ts` — shared TS types
  - `firebase.ts` — Firebase init and error helper
  - `public-colony-config.ts` — single source for public colony identity and public content arrays
  - `data/seedData.ts` — demo seed data and demo profiles
  - `components/Public*.tsx` — public website components
  - `components/Header.tsx`, `MobileBottomNav.tsx` — authenticated app chrome
  - `components/*App/*` — role dashboards
- `/api`
  - `classify-issue.ts` — AI classification endpoint used by the app
- `/server.ts` — Express wrapper for dev/prod serving

## Architecture
- Single React app, one build output.
- Public site and authenticated app share the same bundle but render differently based on:
  - current path,
  - whether the route is a public route,
  - Firebase auth state,
  - demo mode env flag.
- Global state lives in `AppContext`. Many features are optimistic-local-first and attempt Firestore writes in the background.
- Public content is intentionally separated from private app data. Public pages do **not** read private Firestore collections for display.

## Routing
Hash-based routing using `#` prefixes.

Public guest routes:
- `#/home`
- `#/chat`
- `#/announcements`
- `#/announcements/:id`
- `#/login`
- `#/register`

Authenticated role routes:
- `#/resident/...`
- `#/security/...`
- `#/authority/...`
- `#/admin/...`

Router conventions:
- `parseRoute()` derives route params from the current hash path.
- `checkRoleAllowed()` determines whether current role can access a path.
- `checkPublicRoute()` determines whether a path is a public guest route.
- Default path when no hash is present is `/home`.

Public shell:
- `App.tsx` renders a separate public shell (`PublicHeader` + `PublicRoutes`) when the current route is public.
- Authenticated app shell is unchanged and keeps existing role dashboards.

## Coding conventions
- Keep the existing visual identity for the authenticated app.
- Keep the approved public website style:
  - white background
  - blue accents
  - compact header with Home / Chat / Announcements / Login / Register
  - responsive desktop and mobile behavior
- Use `src/public-colony-config.ts` for public colony identity and public content arrays.
- Do not hardcode colony name/address/map in individual public components.
- Avoid unnecessary rewrites. Prefer small targeted edits.
- Keep components focused. Do not move responsibilities between public and private apps unless required by the current phase.

## Authentication and RBAC
Firebase auth is used for sign-in. Existing role flow:
- On sign-in, user profile is fetched/created from Firestore `users/{uid}`.
- App behavior depends on `currentUser.role`.
- Demo mode can switch personas without Firebase for local testing.

Known roles from `src/types.ts`:
- `resident`
- `rwa_admin`
- `water_worker`
- `electrical_worker`
- `sanitation_worker`
- `maintenance_worker`
- `security_guard`

Role routing rule of thumb:
- Residents use `#/resident`
- Security uses `#/security`
- Maintenance authorities use `#/authority`
- RWA admin uses `#/admin`

Security requirements:
- Public pages must not grant roles or privileges from URL params.
- Public pages must not expose private data.
- Public pages must not weaken Firestore security rules.
- Hiding UI is not sufficient; access control and data access must both be safe.

## Privacy requirements
Public website must never expose:
- flat numbers tied to residents
- resident phone numbers
- private visitor records
- private issues or internal notes
- resident-only announcements
- resident directories
- anything from private Firestore collections used as a shortcut

If verified public content is unavailable, use clean empty states, not fabricated residents, posts, events, or notices.

## Commands
From repo root:

- Install dependencies:
  - `npm install`
  - If peer dependency resolution fails in this environment, use `npm install --legacy-peer-deps`.
- Dev server:
  - `npm run dev`
- Build:
  - `npm run build`
- Start production server:
  - `npm start`
- Typecheck/lint:
  - `npm run lint`
- Preview:
  - `npm run preview`
- Clean build artifacts:
  - `npm run clean`

Note:
- `npm run lint` maps to `tsc --noEmit` in this project.
- This repo currently installs with `--legacy-peer-deps` in some environments due to a peer dep conflict in the lockfile. That is an environment/lockfile issue, not a code issue introduced by the public site work.

## Testing standards
- Run `npm run lint` before considering a change done.
- Run `npm run build` to catch hard errors.
- After any public-site change, manually verify:
  - `/home`, `/chat`, `/announcements`, `/announcements/:id`, `/login`, `/register`
  - mobile header and menu
  - guest read-only behavior
  - login/register navigation
  - that existing authenticated routes still work
- Do not treat a successful build alone as proof of correct behavior.
- If a change touches routing or auth, verify both public and authenticated paths.

## Public content rules
- Single source for public colony facts: `src/public-colony-config.ts`.
- Public arrays in that config:
  - `publicFacilities`
  - `publicAnnouncements`
  - `publicPosts`
- If an array is empty, the related public page must show a clean empty state.
- Do not pre-populate public arrays with invented residents, posts, events, facilities, or notices.
- Facilities and internal map pins require verification before publishing.

## Colony data
Current verified public colony identity:
- Name: Panchkuian Road Railway Colony
- Area: Railway Colony, Paharganj
- City: New Delhi
- State: Delhi
- PIN: 110055
- Country: India
- Map link: https://maps.app.goo.gl/R54A6rW274PAqUE28

Public placeholder state:
- Colony facilities: not published yet
- Public announcements: none verified yet
- Public posts: none verified yet
- Internal facility pins / exact building layouts: not shown until verified

Do not invent:
- colony address variations
- block counts
- resident counts
- facility lists
- events
- emergency notices
- community posts

## Roadmap

### Phase 1
Public website, colony map, facilities, public Chat, Announcements, Events preview, Login/Register.

Status:
- Public routes exist: `/home`, `/chat`, `/announcements`, `/announcements/:id`, `/login`, `/register`.
- Colony identity is centralized in `src/public-colony-config.ts`.
- Public content arrays are intentionally empty until verified.
- Google Maps link is included as a working “Open in Google Maps” action.
- Map itself remains a placeholder until verified internal facility/location data is available.

### Phase 2
Resident community, issues, visitors, deliveries, events, notifications.

This phase builds on top of the authenticated resident experience.

### Phase 3
Security, authorities, RWA management, permissions, AI issue routing.

This phase covers operational dashboards and AI-assisted issue classification/routing flows.

## Working rules for agents
- Inspect the repo before changing anything.
- Preserve approved UI design.
- Never invent colony information.
- Never expose private data.
- Avoid unnecessary rewrites.
- Complete one phase at a time.
- Mark unknowns clearly instead of guessing.

## Unknowns / not yet verified
- Internal colony facility list
- Internal facility locations and map pin data
- Verified public announcements
- Verified public posts/events
- Exact colony coordinates beyond the supplied Maps link
- Whether any public content should eventually be served from a backend public endpoint instead of static config
