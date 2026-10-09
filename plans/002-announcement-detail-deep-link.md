# 002 — Announcement detail deep link

**Snapshot:** `59b9607`  
**Category:** correctness  
**Effort:** S  
**Risk:** low  
**Confidence:** high  

## Why this matters

Announcement detail is the most direct “click an item and see the item” flow in the app. If the route cannot parse the id correctly, the app either shows the wrong screen, an empty state, or a broken placeholder. That is a visible integration bug even before any new feature work.

## Problem statement

1. Public announcement detail route parsing is not clean for `/announcements/:id`.
2. The public app already has a `PublicAnnouncementDetail`-style view in `src/App.tsx`, but the router does not consistently feed it a real `id`.
3. Resident announcement detail exists in the resident shell, but the same id parsing gap can make deep links awkward.

## Scope

### In scope

- `src/router/Router.tsx`
- `src/App.tsx`
- `src/components/PublicAnnouncementsPage.tsx`
- `src/components/ResidentApp/ResidentApp.tsx`
- `src/components/ResidentApp/OfficialAnnouncements.tsx`

### Out of scope

- New announcement data model
- New announcement authoring flow
- Firestore rules beyond what is needed to make reads safe for signed-in users

## Current state

### Public route parsing

`src/router/Router.tsx` includes public announcement handling, but the public branch derives id in a way that assumes a multi-segment public layout. That makes `/announcements/:id` unreliable for the simple public case.

Exact excerpt to inspect:

```ts
if (firstSegment && PUBLIC_SECTIONS.includes(firstSegment)) {
  const section = parts[1] || firstSegment;
  const id =
    firstSegment === 'announcements' && parts.length >= 2
      ? parts[1]
      : parts[2] || undefined;
```

This is the core of the bug: for a plain `/announcements/ann-1` path, the public branch does not cleanly map `ann-1` to `id` in the intended way once the section assignment and id extraction are combined.

### Public detail view

`src/App.tsx` already contains a public announcement detail path, for example:

```tsx
if (params.section === 'announcements') {
  if (params.id) {
    return (
      <div className="mx-auto max-w-2xl">
        <PublicAnnouncementDetail announcementId={params.id} />
      </div>
    );
  }
  return <PublicAnnouncementsPage />;
}
```

So the UI exists; the parser is the gap.

### Resident announcement detail

The resident shell already drives detail from params.id, for example in `src/components/ResidentApp/ResidentApp.tsx`:

```ts
const selectedAnnouncement = currentSection === 'announcements' && params.id
  ? announcements.find((a) => a.id === params.id) || null
  : null;
```

So resident detail is mostly wired; the main public gap is parsing.

## Target behavior

1. `/announcements/:id` opens the public announcement detail for a valid public announcement id.
2. If the public announcement id is unknown, the app shows an honest empty state, not a broken view.
3. Resident announcement detail continues to work through the existing resident route shape.

## Steps

### 1. Fix public announcement id parsing

File: `src/router/Router.tsx`

Target behavior:
- When the public section is `announcements`, set `id` to the next segment when present.
- Ensure the parser does not require a role-style second section to extract an id for the public route.

Acceptance:
- `parseRoute('/announcements/ann-1')` yields `id: 'ann-1'`.

### 2. Ensure public announcement detail uses the parsed id

File: `src/App.tsx`

Target behavior:
- The public announcement detail path should be driven by the parsed public `params.id`.
- If the id does not match any public announcement, show an honest “announcement not found” state with a back action.

Acceptance:
- Public announcement detail opens for a valid id from public content.
- Unknown public id shows a correct empty/not-found state.

### 3. Confirm resident announcement detail still works

Files:
- `src/components/ResidentApp/ResidentApp.tsx`
- `src/components/ResidentApp/OfficialAnnouncements.tsx`

Target behavior:
- Resident announcement list items should navigate to `/resident/announcements/<id>`.
- Resident detail modal/view should open for the selected announcement.

Acceptance:
- Resident announcement detail opens from the resident announcements list.

## Verification

```bash
npm run lint
npm run build
```

Browser checks:
- From public announcements, click an announcement and confirm detail opens.
- Directly open `#/announcements/<id>` and confirm detail or a correct empty state appears.
- From resident announcements, open an announcement detail and confirm it shows.

## Test plan

Add a route-parse test that includes announcement detail paths:

- public `/announcements/<id>`
- resident `/resident/announcements/<id>`

Also add an announcement detail rendering check in the public path that fails if the detail view is shown with an empty id when a real id is supplied.

## Maintenance notes

- If the public colony later gets real public announcements, keep the same id shape so deep links remain stable.
- If resident announcements adopt more filtering by block, confirm detail routing still works for the current id-based approach.

## Escape hatches

- If public announcement detail appears but the app still cannot parse id reliably, stop and report rather than hardcoding one special case.
