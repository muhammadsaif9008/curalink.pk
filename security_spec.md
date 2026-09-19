# Security Specification & Threat Model for CuraLink

## 1. System Invariants
1. **User Identity Isolation**: A user's private data (`/users/{userId}`) can only be written by the authenticated user whose `request.auth.uid == userId` and whose email is verified.
2. **Consultation Record Integrity**: A consultation record (`/consultations/{consultationId}`) must have a valid doctor or patient association, immutable creation timestamps, and valid non-empty diagnosis and status fields. Only the attending doctor or patient can access the record.
3. **Appointment Scheduling Integrity**: An appointment (`/appointments/{appointmentId}`) cannot be forged or hijacked. Patients can book appointments for themselves (`patientId == request.auth.uid`), and doctors can update the status (`confirmed`, `completed`, `cancelled`).
4. **Prescription Immutability**: A prescription (`/prescriptions/{prescriptionId}`) once issued and signed by a licensed doctor cannot be modified or tampered with by patients or third parties.
5. **No Blind Role Escalation**: Regular users cannot elevate their own role to system admin or falsify PMC licensing credentials without verification.
6. **Query Enforcer**: No blanket collection list scans. All list queries must filter by `patientId == request.auth.uid` or `doctorId == request.auth.uid` or `userId == request.auth.uid`.

## 2. The Dirty Dozen Malicious Payloads

1. **Payload 1 (Identity Hijack)**: Attacker attempts to create a user profile at `/users/victim_123` with `request.auth.uid == attacker_456`. (Violation: Identity Spoofing).
2. **Payload 2 (Ghost Field Injection)**: Attacker adds `isAdmin: true` or `role: 'superadmin'` to their own `/users/{userId}` document. (Violation: Privilege Escalation).
3. **Payload 3 (Orphaned Write Attack)**: Attacker creates a consultation with an arbitrary non-existent `patientId`. (Violation: Relational Integrity).
4. **Payload 4 (Resource Poisoning / Denial of Wallet)**: Attacker attempts to write a 1MB junk string as `diagnosis` or document ID. (Violation: Boundary Limits).
5. **Payload 5 (Unverified Email Write)**: Attacker with an unverified Google account (`email_verified == false`) attempts to issue medical prescriptions. (Violation: Verified User Requirement).
6. **Payload 6 (Terminal State Bypass)**: Attacker attempts to reopen or rewrite a `status: 'completed'` consultation report or dispensed prescription. (Violation: Terminal State Locking).
7. **Payload 7 (Shadow Key Injection)**: Attacker attempts an update with an unauthorized key `incoming().diff(existing()).affectedKeys()`. (Violation: Strict Key Enforcer).
8. **Payload 8 (Client Delegation Query Scrape)**: Attacker attempts to list all consultations without constraining `patientId` or `doctorId`. (Violation: Query Enforcer).
9. **Payload 9 (Doctor Signature Forgery)**: Non-doctor patient attempts to sign a prescription document with a fabricated PMC registration number. (Violation: ABAC Role Validation).
10. **Payload 10 (Timestamp Spoofing)**: Attacker sends a manual future or past `createdAt` date instead of `request.time`. (Violation: Temporal Integrity).
11. **Payload 11 (ID Injection Attack)**: Attacker uses a malformed document ID containing path traversal characters `../../`. (Violation: ID Poisoning Guard).
12. **Payload 12 (Immortal Field Mutating)**: Attacker modifies `patientId` or `createdAt` on an existing consultation during an update. (Violation: Immortal Field Rule).
