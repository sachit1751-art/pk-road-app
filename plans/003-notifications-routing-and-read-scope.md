# 003 — Notification routing and read scope

**Snapshot:** `59b9607`  
**Category:** correctness + security  
**Effort:** M  
**Risk:** medium  
**Confidence:** medium to high  

## Why this matters

Notifications are the main “jump to the right thing” surface in the app. If clicking a notification routes to the wrong place, or if notification reads are too broad, the feature feels broken and can leak private colony activity to the wrong signed-in viewers.

## Problem statement

1. Many notifications are written without `userId`, which makes them hard to scope as private per-user items.
2. There is no reliable mapping from a notification’s type and `relatedId` to a navigable resident route.
3. Notification taps can open a broken route, or they can open a useful route only sometimes.
4. Notification reads are too broad when notifications are not properly scoped to their audience.

## Scope

### In scope

- `src/context/AppContext.tsx`
- `src/components/ResidentApp/ResidentApp.tsx`
- `firestore.rules`
- `src/types.ts` for `AppNotification` (read-only reference)

### Out of scope

- New notifications collection shape
- New notification service
- Broad redesign of the notification UI
- Email or push notification delivery

## Current state

### Notification shape

`src/types.ts`

```ts
export interface AppNotification {
  id: string;
  userId?: string;
  flatNumber?: string;
  title: string;
  message: string;
  type: 'visitor' | 'issue_update' | 'announcement' | 'emergency' | 'verification';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}
```

This shape already has the pieces we need: `userId`, `flatNumber`, `type`, and `relatedId`.

### How notifications are created

`src/context/AppContext.tsx` creates many notifications, but not all of them set `userId`. For example:

- visitor arrival notifications often set `flatNumber` and sometimes leave `userId` unset
- expedited visitor entry notifications set `flatNumber`
- announcement publish notifications are created with only `title`/`message`/`type`/`relatedId` and no `userId`
- some issue-related notifications set `userId` where relevant, but not consistently for all issue events

Exact excerpt to inspect:

```ts
const notif: AppNotification = {
  id: 'notif-' + Date.now(),
  title: `New ${data.department} Ticket: ${data.title}`,
  message: `${currentUser.name} reported: ${data.title} at ${data.locationDetails}`,
  type: 'issue_update',
  relatedId: issueId,
  isRead: false,
  createdAt: new Date().toISOString(),
};
```

This notification does not set `userId` or `flatNumber`.

### How notifications are read in the app

`src/context/AppContext.tsx` reads notifications with:

```ts
const unsubNotifs = onSnapshot(
  query(collection(db, 'notifications'), where('userId', 'in', [currentUser.uid, 'ALL'])),
  ...
);
```

That means any notification whose `userId` is `'ALL'` is readable by any signed-in user whose role permits notification reads.

### Notification rules

`firestore.rules`

```js
match /notifications/{notificationId} {
  allow read: if isSignedIn() && (
    resource.data.userId == request.auth.uid ||
    resource.data.userId == 'ALL' ||
    isAdmin()
  );

  allow create: if isAdmin() || isSecurityGuard() || isWorker();

  allow update: if isSignedIn() && (
    resource.data.userId == request.auth.uid ||
    isAdmin()
  );

  allow delete: if isSignedIn() && (
    resource.data.userId == request.auth.uid ||
    isAdmin()
  );
}
```

This is the crux of the concern: a notification written with `userId == 'ALL'` is readable by any signed-in user.

### Where notification taps are currently handled

- `src/components/AuthorityApp/AuthorityDashboard.tsx` already has a small notification-to-ticket tap path using `notif.relatedId`.
- The resident app does not yet have a consistent notification tap handler that maps `type + relatedId` to a resident route.

## Target behavior

1. Clicking a notification opens the right resident section when possible.
2. If the target item is not available, the tap opens the parent section and marks the notification read.
3. Notification reads are scoped to the intended audience:
   - user-specific notifications are readable by the target user and admins
   - broadcast notifications are readable only when they are intentionally broadcast
4. The app does not navigate to broken routes.

## Steps

### 1. Make user-targeted notifications actually target a user

File: `src/context/AppContext.tsx`

Target behavior:
- For notifications that belong to a specific resident, set `userId` to that resident’s uid where the app already knows it.
- Keep `flatNumber` where it is useful for flat-scoped display, but do not rely on `flatNumber` alone as the privacy boundary.

Concrete cases to fix:
- visitor arrival and expedited entry notifications that are flat-scoped should also reflect the intended resident audience when known
- issue-related notifications that are meant for the reporter should set `userId`
- announcement notifications that are broadcast should remain broadcasts, but not be used as a loophole for private items

Do not change the `AppNotification` shape in this plan. Use the existing fields.

Acceptance:
- User-targeted notifications include `userId` when the app knows the intended user.
- Broadcast notifications remain explicitly broadcast.

### 2. Add a notification tap mapper in the resident shell

Files:
- `src/components/ResidentApp/ResidentApp.tsx`

Target behavior:
- Map notification taps to resident routes where reliable:
  - `visitor` with a `relatedId` → `/resident/visitors/<relatedId>`
  - `issue_update` with a `relatedId` → `/resident/issues/<relatedId>`
  - `announcement` or `emergency` with a `relatedId` → `/resident/announcements/<relatedId>`
  - `verification` → `/resident/profile`
- If the mapped item is not present in current local state, fall back to the parent section and mark the notification read.
- Always mark the tapped notification read when the tap is handled.

Acceptance:
- Notification taps go to a real resident route when the related item exists locally.
- Otherwise they open the parent section and mark read.
- No tap produces a broken route.

### 3. Tighten notification reads in Firestore rules

File: `firestore.rules`

Target behavior:
- Keep notification reads for the intended recipient and admin.
- Keep explicit broadcasts readable, but do not let the broadcast principal become a default backdoor for private notifications.
- The minimal safe correction is to ensure the rule does not treat `userId == 'ALL'` as a universal read grant for every signed-in user if the app is relying on `ALL` because of missing `userId` values.

Because this plan also fixes app-side notification authorship, the rule correction should be paired with the app fix. Do not loosen the rule to accommodate missing `userId` values.

Acceptance:
- A signed-in user cannot read another user’s private notification just because the notification lacks a userId.
- Explicit broadcasts are still broadcast for the cases that are intentionally broadcast.

## Verification

```bash
npm run lint
npm run build
```

Browser checks:
- In the resident app, click a visitor notification and confirm it opens the visitor detail or the visitors list.
- Click an issue notification and confirm it opens the issue detail or the issues list.
- Click an announcement/emergency notification and confirm it opens the announcement detail or the announcements list.
- Click a verification notification and confirm it opens the profile or the appropriate parent section.
- Confirm unknown related items do not cause broken routes.

Rule verification:
- Review the rule diff in the executor worktree.
- Confirm the rule still allows legitimate reads for the target user and admin.
- Confirm broadcasts are intentionally limited.

## Test plan

No existing tests exist, so add focused checks:

1. A notification routing test that maps notification types to routes and asserts the expected fallbacks.
2. A notification authoring check that asserts user-targeted notifications include a `userId` when the app knows the intended user.
3. A Firestore rule review check that fails if the notification rule still allows any signed-in user to read arbitrary notifications by virtue of the `ALL` principal alone.

## Maintenance notes

- If the notification shape later gains a dedicated `audience` field, update both the app and the rules together.
- If more notification types are added, extend the mapper explicitly; do not rely on generic string matching that can route to broken paths.

## Escape hatches

- If the app cannot identify the intended user for a notification without introducing unsafe assumptions, stop and report rather than inventing a userId.
- If the rule change would break the app’s existing legitimate reads, stop and report and align the app-side fix first.
