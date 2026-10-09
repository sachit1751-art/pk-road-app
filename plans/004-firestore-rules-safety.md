# 004 — Firestore rule safety corrections

**Snapshot:** `59b9607`  
**Category:** security  
**Effort:** M  
**Risk:** medium  
**Confidence:** high  

## Why this matters

The app already assumes authenticated resident workflows for posts, issues, visitors, announcements, and notifications. The rules should match that assumption without weakening boundaries. The most important correction in this slice is that posts and notifications should not become broadly readable just because a signed-in account exists.

## Problem statement

1. Posts are currently readable by any signed-in user.
2. Notifications can be readable by any signed-in user when they are written with `userId == 'ALL'` or when `userId` is missing.
3. These two issues are related: the app writes some notifications without a userId, and the rules currently allow broad notification reads through the `ALL` principal.

## Scope

### In scope

- `firestore.rules`

### Out of scope

- Changing `users`, `preapproved_visitors`, `verification_requests`, `issues`, `visitors`, or `announcements` rule logic except where a real inconsistency exists between current app behavior and rules
- Adding new collections
- Weakening any rule for convenience

## Current state

### Posts rule

`firestore.rules`

```js
match /posts/{postId} {
  allow read: if isSignedIn();
  allow create: if isVerifiedResident() && request.resource.data.authorId == request.auth.uid;
  allow update: if isSignedIn() && (
    resource.data.authorId == request.auth.uid ||
    isAdmin() ||
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likesCount'])
  );
  allow delete: if isSignedIn() && (
    resource.data.authorId == request.auth.uid ||
    isAdmin()
  );
}
```

Reading posts only requires `isSignedIn()`. That is too broad for a resident-centric colony app if the app’s posts are meant as community content inside the authenticated resident experience.

### Notifications rule

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

The dangerous part is `resource.data.userId == 'ALL'`. If app code writes a notification without a proper `userId` and falls back to `ALL`, then any signed-in user can read it. That is not acceptable for private colony notifications.

### What the app currently assumes

- Posts are created by verified residents and updated/deleted by the author, admin, or via likesCount-only diff.
- Notifications are created by admin, security, or worker flows.
- The app reads notifications by `userId in [currentUser.uid, 'ALL']`.

The safe correction is to make the rules match intended audiences, not to widen them.

## Target behavior

1. Posts are readable only by signed-in users who are legitimate colony roles, not by any signed-in account.
2. Notifications are readable by the intended audience:
   - the target user
   - admins
   - explicitly intended broadcasts, if broadcasts are still intentional
3. The app does not gain access to private notifications because a notification was written without a userId.

## Steps

### 1. Narrow post reads to legitimate colony roles

File: `firestore.rules`

Target behavior:
- Change post read from `isSignedIn()` to a check that requires a known colony role.
- Keep the existing role helpers and do not invent a new one.
- Do not require verified status for reading posts unless the app is also changed to match that requirement. In this slice, the safer correction is to require a known colony role.

Suggested shape:
- Allow read if signed in and the user is one of: resident, rwa_admin, security_guard, or one of the four worker roles.

Acceptance:
- A generic signed-in account without a recognized colony role cannot read posts.

### 2. Tighten notification reads

File: `firestore.rules`

Target behavior:
- Keep user-specific notification reads for the target user and admin.
- Keep broadcast notifications readable only when they are genuinely broadcast by design.
- Remove or restrict the overly broad `ALL` read grant so missing userId does not make a notification globally readable.

Because the app in plan 003 will also be corrected to set `userId` for user-targeted notifications, this rule change should be paired with that app fix. Do not relax the rule to accommodate missing userId values.

Acceptance:
- A signed-in user cannot read another resident’s private notification because the notification lacked a userId.
- Legitimate broadcast notifications are still readable when intentionally broadcast.

### 3. Leave other collections alone unless a real mismatch exists

File: `firestore.rules`

Target behavior:
- Do not change `users`, `preapproved_visitors`, `verification_requests`, `issues`, `visitors`, or `announcements` unless you find a concrete mismatch between the app’s current behavior and the rules.
- If you find one, fix the minimum necessary part and report it.

Acceptance:
- The rule diff is small and targeted.

## Verification

```bash
npm run lint
npm run build
```

Manual verification:
- Review the rule diff in the executor worktree.
- Confirm post reads are restricted to legitimate colony roles.
- Confirm notification reads are not broadly open through `ALL` alone.
- Confirm user-targeted reads still work for the intended user and admin.

## Test plan

No existing tests run against Firestore rules in this repo, so add a reviewable artifact instead of a flaky runtime test:

1. A documented rules diff comment or short review checklist in the plan execution record that confirms:
   - post read restriction
   - notification read restriction
   - no new broad grants introduced

If the executor can run a rules-lint or rules simulator step safely, include it, but do not invent a destructive test against a live database.

## Maintenance notes

- If more collections become resident-only later, update the rules as part of that feature, not as a side effect.
- If the app later introduces a legitimate broadcast notification pattern, make it explicit and intentional, not accidental through missing fields.

## Escape hatches

- If narrowing post reads breaks a legitimate reader that the app actually needs, stop and report the exact reader instead of over-broadening the rule.
- If the notification rule change blocks a legitimate broadcast, stop and report the exact broadcast use case before relaxing anything.
