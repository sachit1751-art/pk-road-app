# 005 — Resident shell state, deliveries, and events guidance

**Snapshot:** `59b9607`  
**Category:** correctness + docs + direction  
**Effort:** S  
**Risk:** low  
**Confidence:** medium  

## Why this matters

This plan is mostly about keeping the existing resident shell understandable and honest, and documenting the correct Phase 2 posture for deliveries and events. It is intentionally not a “build a new screen” plan.

## Problem statement

1. The resident shell has a few states that can be misread:
   - auth loading vs ready state
   - verified vs pending vs rejected resident states
   - delivery visitors vs guest visitors
   - event-like community posts vs a dedicated events model
2. There is no explicit guidance that deliveries stay inside the visitors/activity flow and events stay inside the `CommunityPost` events channel for now.

## Scope

### In scope

- `src/components/ResidentApp/ResidentApp.tsx`
- `src/components/ResidentApp/VisitorsHub.tsx`
- `src/components/ResidentApp/ResidentProfile.tsx`
- `src/components/ResidentApp/VerificationModal.tsx`
- `src/components/ResidentApp/CommunityDiscussions.tsx`
- `src/context/AppContext.tsx` for the existing state/operation shape
- documentation of the delivery and events decisions

### Out of scope

- New deliveries screen
- New events model
- New RSVP flow
- Firestore rules unless a concrete mismatch is found

## Current state

### Deliveries

The app already supports delivery-type visitors through the existing visitor model. For example:

`src/types.ts`

```ts
export type VisitorType =
  | 'Guest'
  | 'Delivery'
  | 'Plumber'
  | 'Electrician'
  | 'Technician'
  | 'Domestic worker'
  | 'Cab/driver'
  | 'Service provider'
  | 'Other';
```

`src/components/ResidentApp/VisitorsHub.tsx` already renders `Delivery` visitors with a truck icon and treats them like other visitor entries.

So deliveries are already inside the visitors/activity experience. The only Phase 2 question is whether to add a dedicated deliveries screen. The answer for this slice is no, unless the current architecture cannot support the workflow cleanly.

### Events

The community channel list already includes `events`:

`src/components/ResidentApp/CommunityDiscussions.tsx`

```ts
const channels: { id: ChannelId; label: string; icon: any; desc: string }[] = [
  { id: 'general', label: 'General', icon: MessageSquare, desc: 'Casual colony chat & notices' },
  { id: 'buy-sell', label: 'Buy & Sell', icon: ShoppingBag, desc: 'Marketplace for furniture, items' },
  { id: 'lost-found', label: 'Lost & Found', icon: AlertCircle, desc: 'Lost pets, keys, items' },
  { id: 'events', label: 'Events', icon: Calendar, desc: 'Festivals, sports, yoga' },
  { id: 'help', label: 'Resident Help', icon: HelpCircle, desc: 'Emergency neighbor assistance' },
  { id: 'recommendations', label: 'Recommendations', icon: Sparkles, desc: 'Maids, cooks, carpenters' },
];
```

So event-like community content can live in `channel: 'events'` using the existing post/comment/react UI. There is no need for a separate events model or RSVP flow in this slice.

### Resident shell state

`src/components/ResidentApp/ResidentApp.tsx` already computes:

```ts
const isVerified = currentUser.verified && currentUser.verificationStatus === 'approved';
const isPendingVerification = currentUser.verificationStatus === 'pending';
const isRejectedVerification = currentUser.verificationStatus === 'rejected';
```

That is good. The main improvement here is readability and honest empty states, not new flows.

## Target behavior

1. Deliveries continue to appear as visitor entries with `visitorType: 'Delivery'` and are served from the existing visitors hub and visitor detail modal.
2. Event-like community content uses `channel: 'events'` and the existing community UI.
3. The resident shell’s key states are clear and honest:
   - unverified
   - pending verification
   - rejected verification
   - verified
4. Empty states remain honest; no fabricated demo records are written into live colony collections.
5. If Firebase configuration or test credentials are unavailable, the limitation is documented rather than faked.

## Steps

### 1. Keep deliveries in the visitors flow

Files:
- `src/components/ResidentApp/VisitorsHub.tsx`
- `src/components/ResidentApp/VisitorDetailModal.tsx`

Target behavior:
- Delivery visitors are shown as delivery entries.
- Delivery details are visible in the existing visitor detail modal.
- No new deliveries screen is introduced unless a later audit proves the current flow cannot support the workflow cleanly.

Acceptance:
- A delivery visitor is displayed and detailed through the existing visitor UI.

### 2. Keep events in the existing events channel

File:
- `src/components/ResidentApp/CommunityDiscussions.tsx`

Target behavior:
- Event-like posts use `channel: 'events'`.
- Event previews, comments, and reactions use the existing community UI.
- If the events channel is empty, it stays empty. Do not fabricate demo events into live colony collections.

Acceptance:
- The events channel is usable for event-like posts without a separate model.

### 3. Make resident shell states explicit

Files:
- `src/components/ResidentApp/ResidentApp.tsx`
- `src/components/ResidentApp/ResidentProfile.tsx`
- `src/components/ResidentApp/VerificationModal.tsx`

Target behavior:
- Verified, pending, rejected, and unverified states are presented clearly.
- Empty states for issues, visitors, passes, and announcements are honest.
- The app does not pretend a feature is live when it has no data.

Acceptance:
- The resident shell communicates the current verification and data state clearly.

### 4. Document the Firebase/verification limitation

Files:
- `plans/README.md` or a short note in the execution record

Target behavior:
- If Firebase is not configured or test credentials are unavailable, document that real Firestore-backed resident workflows cannot be fully verified in this environment.
- Do not fake a successful integration.

Acceptance:
- The limitation is recorded plainly.

## Verification

```bash
npm run lint
npm run build
```

Browser checks:
- Verify delivery visitors appear in the visitors hub.
- Verify event channel is available in community discussions.
- Verify verification states render correctly for the current user persona.

## Test plan

No existing tests exist, so add lightweight checks:

1. A visitor-type rendering check that confirms `Delivery` is handled by the existing visitor UI.
2. A channel list check that confirms `events` is present.
3. A verification state check that confirms the resident shell renders the correct state banners for pending/rejected/verified personas in demo mode.

## Maintenance notes

- If a later phase adds a dedicated deliveries model, keep it additive and do not delete the existing visitor path without review.
- If events later need RSVP or calendar features, add them as a separate scope with their own data model.

## Escape hatches

- If the resident shell state logic starts to conflict with the verified-resident rule changes in other plans, stop and reconcile before continuing.
- If deliveries or events later reveal a real architectural gap, document it and stop rather than forcing a new screen as a workaround.
