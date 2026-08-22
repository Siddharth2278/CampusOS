# CampusOS — Locked Role & Workflow Plan

## Authority

### Principal
- The system allows exactly one Principal.
- Principal creates departments.
- Principal assigns exactly one approved teacher as HOD for each department.
- Principal does not create ordinary teacher accounts.
- Principal does not create subjects or faculty assignments.
- Principal can approve teacher registrations only for departments that do not yet have an HOD (bootstrap flow).
- Once a department has an HOD, teacher registration approval goes to that department HOD.
- Principal sees only campus-level administration information.

### HOD
- Exactly one HOD per department.
- HOD is also a teacher.
- HOD manages only their own department.
- HOD creates/edits department subjects.
- HOD assigns multiple subjects to teachers; assignments are editable/removable.
- HOD assigns one Class Teacher per semester in their department.
- HOD manages their department timetable.
- HOD can perform teacher functions: timetable, assigned subjects, attendance, assignments, etc.
- HOD approves teacher registrations for their department.
- If the HOD is also the Class Teacher, they can approve student registrations for their assigned semester.

### Teacher
- Teacher self-registers and selects a department.
- Registration is pending until approved.
- If the selected department already has an HOD, the request goes to that HOD.
- Teacher teaches only subjects assigned by the HOD.
- Teacher may teach multiple subjects.
- Teacher can use attendance/assignments for assigned subjects.
- A teacher assigned as Class Teacher approves students for that semester only.

### Student
- Student self-registers and selects department + semester.
- Student registration is pending.
- Approval goes only to the Class Teacher assigned by that department's HOD for that semester.
- Student sees only their own department/semester information.

## Other rules
- HOD creates department subjects.
- Faculty assignment is controlled only by HOD.
- One teacher can have many subject assignments.
- Exactly one HOD per department.
- Every successful mutation triggers frontend data refresh.
- All roles have Change Password.
- Existing email registration displays a clear "already registered — go to Login" option.
- Do not expose irrelevant modules/options on a role's dashboard.
- Existing completed modules, including Exam Management and LeaveRequestRepository, are preserved.
- Database is reset manually once with `database/RESET_ALL_DATA.sql`, then data is entered from the frontend from a clean state.
