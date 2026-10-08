# Security Specification for Colony Community & Operations Platform

## 1. Data Invariants
- Users can view and manage their own profile.
- Admin and security staff can read user directory and verify residents.
- Issues can be created by verified residents.
- Authority workers can view issues for their assigned department and update status.
- Security guards can create visitor entries, mark exits, and look up flats.
- Residents can only read visitor entries targeted to their own flat/block.
- Announcements are read-only for residents; only Admins can create/edit announcements and emergency alerts.
- Community channel posts can be created by authenticated residents and deleted by author or admin.
- Notifications are strictly partitioned to target user ID or targeted flat.

## 2. Dirty Dozen Test Cases
1. Resident attempting to view visitor records of another flat -> DENIED
2. Non-admin attempting to create colony-wide announcement or emergency alert -> DENIED
3. Resident attempting to modify another resident's issue status -> DENIED
4. Worker updating an issue outside their department queue without assignment -> DENIED
5. Unauthenticated user creating an issue or reading visitor entries -> DENIED
6. Guard injecting invalid arbitrary fields into visitor records -> DENIED
7. Resident spoofing authorId on community posts -> DENIED
8. Unauthenticated client reading private user contact info -> DENIED
9. Resident attempting to self-assign Admin or Security Guard role without verification -> DENIED
10. Attacker modifying immutable createdAt timestamps -> DENIED
11. Attacker exceeding string length boundaries (>10000 chars) -> DENIED
12. Attempt to write to arbitrary root paths not declared in blueprint -> DENIED
