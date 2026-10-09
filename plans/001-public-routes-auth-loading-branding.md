# 001 — Public routes, auth loading safety, and public-facing branding

**Snapshot:** `59b9607`  
**Category:** correctness + security + docs  
**Effort:** M  
**Risk:** low to medium  
**Confidence:** high  

## Why this matters

This is the first Phase 2 integration fix because it touches the public entry points and the public-facing identity of the app. If public routes are misparsed or public copy still advertises the wrong colony, later resident work will be built on top of a confusing or inconsistent public shell.

## Problem statement

1. Public login/register pages exist, but the router does not treat `#/login` and `#/register` as clean terminal public routes in all cases.
2. `App.tsx` still blocks rendering on `isAuthLoading` in a way that can leave the app stuck when the Firebase user is present but the Firestore user doc lookup fails or the app is not in demo mode.
3. Public-facing copy still uses `ColonyHub` and `Greenwood Estate` in several places instead of the verified `PK Road App` and `Panchkuian Road Railway Colony` identity.

## Scope

### In scope

- `src/router/Router.tsx`
- `src/App.tsx`
- `src/public-colony-config.ts`
- `src/components/PublicHeader.tsx`
- `src/components/PublicHomePage.tsx`
- `src/components/PublicChatPage.tsx`
- `src/components/PublicAnnouncementsPage.tsx`

### Out of scope

- Resident dashboards
- Security/Authority/Admin dashboards
- Firestore rules
- New screens
- Demo seed data rewrite

## Current state

### Router public section behavior

`src/router/Router.tsx` already includes a `PUBLIC_SECTIONS` list and public parse logic, but:

- The public branch currently treats `/announcements/:id` and similar paths through a segment-splitting assumption that does not cleanly separate `announcements` as a terminal public section with an optional id.
- `#/login` and `#/register` can be mis-handled because the public parse path is centered on multi-segment public pages rather than terminal public auth pages.

Exact excerpt to inspect:

`src/router/Router.tsx`

```ts
const PUBLIC_SECTIONS = ['home', 'chat', 'announcements', 'login', 'register'];
```

and the public parsing branch around:

```ts
if (firstSegment && PUBLIC_SECTIONS.includes(firstSegment)) {
  const section = parts[1] || firstSegment;
  const id =
    firstSegment === 'announcements' && parts.length >= 2
      ? parts[1]
      : parts[2] || undefined;
```

### Auth loading behavior

`src/App.tsx` currently blocks the entire app while `isAuthLoading` is true:

```ts
if (isAuthLoading) {
  return (
    <div className="min-h-screen bg-white text-[#1A2530] flex flex-col items-center justify-center font-sans">
      ...
      <p className="text-xs text-stone-600 mt-3 font-semibold">Authenticating PK Road App...</p>
    </div>
  );
}
```

That is acceptable for the initial auth decision, but it is unsafe if the app can sit there indefinitely when:
- Firebase auth resolves, but
- the Firestore user doc does not exist yet, or
- the app is not in demo mode and the user doc fetch fails.

### Public-facing branding

Public shells still use `ColonyHub` in places. For example:

`src/App.tsx`

```tsx
<span className="text-lg font-bold tracking-tight text-[#1A2530]">ColonyHub</span>
```

Public config still bundles old brand copy:

`src/public-colony-config.ts`

```ts
const BRAND = {
  name: 'ColonyHub',
  tagline: 'ColonyHub connects residents, community discussions, official notices, and colony services.',
  ...
};
```

Verified colony identity already exists in the same file:

```ts
export const PUBLIC_COLONY = {
  name: 'Panchkuian Road Railway Colony',
  ...
  mapUrl: 'https://maps.app.goo.gl/R54A6rW274PAqUE28',
  ...
};
```

## Target behavior

1. `#/login` and `#/register` resolve to public auth pages without being misread as non-public or unknown routes.
2. Public announcement list and public announcement detail both work through the same public route shape.
3. The app does not freeze indefinitely when auth resolves but the Firestore user document is missing or unavailable. It should still render a usable authenticated shell when the Firebase user exists, while preserving role gating.
4. Public headers, public home/chat/announcements pages, and public config branding use `PK Road App` and the verified colony identity.
5. The visual design is preserved. Only brand names, taglines, and public labels change where they are shown to guests.

## Steps

### 1. Make `/login` and `/register` terminal public routes

File: `src/router/Router.tsx`

Target behavior:
- If the first segment is a public section and that section is a terminal auth route (`login` or `register`), parse it as:
  - `isPublic: true`
  - `section: 'login'` or `'register'`
  - no `id`
- If the first segment is a public section that supports detail (`announcements`), parse the id from the next segment when present.

Acceptance:
- `parseRoute('/login')` returns a public route with `section: 'login'`
- `parseRoute('/register')` returns a public route with `section: 'register'`
- `parseRoute('/announcements/ann-1')` returns a public route with `section: 'announcements'` and `id: 'ann-1'`

### 2. Make `/announcements/:id` parse cleanly for public pages

File: `src/router/Router.tsx`

Target behavior:
- When the first segment is `announcements` in the public branch, derive `id` from the next path segment when present.
- Do not require a second role-based segment just to open a public announcement detail page.

Acceptance:
- Public announcement detail opens with a real `id`, not an empty id.

### 3. Prevent auth loading from freezing the app indefinitely

File: `src/App.tsx`

Target behavior:
- Keep `isAuthLoading` for the initial auth decision.
- When `firebaseUser` exists but `isAuthLoading` is still true because the Firestore user doc lookup is not ready, do not block forever.
- Ensure the app can render the appropriate shell for the current known state:
  - public routes still render for guests
  - authenticated or demo users can enter the role-based app when we have a usable persona
  - a missing Firestore user doc does not trap the app

Do not remove role gating. This change is about avoiding an unrecoverable stuck state, not about bypassing authorization.

Acceptance:
- When Firebase auth resolves but the Firestore user doc is missing, the app still renders and the user can proceed.
- Role-based sections remain protected by the router and Firestore rules.

### 4. Replace public-facing branding

Files:
- `src/public-colony-config.ts`
- `src/App.tsx`
- `src/components/PublicHeader.tsx`
- `src/components/PublicHomePage.tsx`
- `src/components/PublicChatPage.tsx`
- `src/components/PublicAnnouncementsPage.tsx`

Target behavior:
- Replace `ColonyHub` with `PK Road App` in public-facing UI.
- Replace remaining `Greenwood Estate` public-facing references in public shells with the verified colony identity or neutral PK Road App copy.
- Keep the visual design intact.
- Keep public config centralized so the public colony identity is authored in one place.

Acceptance:
- No public shell advertises `ColonyHub` as the public app name.
- Public home/chat/announcements pages use the verified colony identity and PK Road App branding.
- Demo seed identity is not required to change in this plan.

## Verification

```bash
npm run lint
npm run build
```

Expected:
- Lint passes.
- Build passes.

Browser checks:
- Open `#/login` — it should show the public login page.
- Open `#/register` — it should show the public register page.
- Open `#/announcements/ann-1` — it should show a public announcement detail view or a correct empty state if no such public announcement exists.
- Confirm public header/nav shows `PK Road App` and not `ColonyHub`.
- Confirm public home page does not advertise `Greenwood Estate` as the public colony name.

## Test plan

No existing tests exist in the repo, so add focused non-Firebase checks:

1. A small route-parse test module for `src/router/Router.tsx` that asserts:
   - public login and register parse correctly
   - public announcement detail parses an id
2. A branding scan assertion in the same test file or a separate script that fails if the public shells still contain the old brand name. This can be a simple string search over the public component files.

Do not add Firestore integration tests here.

## Maintenance notes

- If more public sections are added later, update the router public branch explicitly for each terminal vs detail-shaped public route.
- If auth loading behavior is changed again, make sure it still blocks unauthenticated private access appropriately.
- Keep public-facing colony identity centralized; do not scatter it across many components.

## Escape hatches

- If the public router change makes role-based routes harder to parse, stop and report rather than force both shapes into one branch.
- If branding replacement uncovers more private dashboard copy that should not be touched, stop and report rather than over-editing authenticated screens.
