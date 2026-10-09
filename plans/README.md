# PK Road App — Phase 2 advisory plans

Plans are written for a weak executor that has not seen this conversation. They are advisory artifacts, not implementation yet. Do not merge or push them as app changes unless an executor has run them and you have reviewed the diff.

## Snapshot

- Branch: `main`
- Commit stamped against: `59b9607`
- Project type: React SPA with a small Express server entrypoint.
- Verification gates used in plans:
  - `npm run lint`
  - `npm run build`
  - manual navigation checks in the browser where noted

## Execution order

1. `001-public-routes-auth-loading-branding.md`
2. `002-announcement-detail-deep-link.md`
3. `004-firestore-rules-safety.md`
4. `003-notifications-routing-and-read-scope.md`
5. `005-resident-shell-state-and-delivery-events.md`

## Dependency graph

- `001` is a prerequisite for `002` only in the sense that both touch public route integrity and public-facing copy. They can be executed independently, but `002` should not land with a broken public announcement detail path.
- `004` should land with or before `003`. Notification read scope and notification routing UX are coupled.
- `005` is mostly documentation and small UX clarifications. It depends on the earlier plans only weakly.

## Status

| Plan | Status |
| --- | --- |
| 001 | complete |
| 002 | complete |
| 003 | complete |
| 004 | complete |
| 005 | complete |

## Scope notes

- These plans cover Phase 2 integration bugs and safety gaps only.
- They do not start Phase 3.
- They do not redesign the app.
- They do not rewrite unrelated modules.
- They do not change unrelated public Phase 1 work except where that work still carries the wrong public-facing colony identity.

## Security and privacy note

Some plans discuss Firestore rules and notification read scoping. Those plans are written to tighten access, not weaken it. Before executing any rule change, review the rule text in the isolated executor worktree and confirm that the app's legitimate reads still work for:
- signed-in residents
- verified residents where relevant
- workers
- security
- admin
