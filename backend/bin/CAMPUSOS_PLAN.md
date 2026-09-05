# CampusOS — Final Role & Flow Plan

## Roles
- PRINCIPAL: one account only. Campus-wide administration.
- HOD: exactly one per department. HOD is also a Teacher.
- TEACHER: teaches one or many subjects assigned by that department's HOD.
- STUDENT: belongs to one department and semester.

## Registration / approval flow
1. Principal registration: only the first Principal account can be registered; it is approved immediately.
2. Teacher registration: public registration creates a PENDING teacher.
   - If the selected department has no HOD yet, approval goes to the Principal.
   - If the department already has an HOD, approval goes only to that HOD.
3. HOD creation: there is no HOD self-registration option. The Principal promotes an approved Teacher to HOD. A department can have only one HOD.
4. Principal-created teacher: Principal may directly create an approved Teacher in a department that already has an HOD.
5. Student registration: creates a PENDING student. Approval goes only to the Class Teacher assigned by that department HOD for the student's semester.
6. Class Teacher assignment: only that department's HOD can assign/change the Class Teacher for a semester.

## Academic management
- Departments: Principal creates.
- Subjects: only HOD creates/edits/deletes, and only for the HOD's own department.
- Faculty assignments: only HOD assigns/edits/removes Teacher ↔ Subject. A Teacher can have many subjects.
- HOD is a Teacher: HOD can receive subject assignments and has a personal timetable/attendance capability.
- Timetable: only HOD edits the timetable of their department/semester. Teacher must be assigned the selected subject. Student/Teacher/HOD can view the appropriate timetable.
- Attendance: Teacher and HOD can mark attendance only for subjects assigned to them. Students view their own attendance.

## Notices
- Student → Teacher only.
- Teacher → Students only.
- HOD → Students or Teachers in the HOD's department.
- Principal → Students, Teachers, HODs, or ALL; department/semester scoping can be used.
- Notice visibility is role/department aware.

## Academic calendar
- Principal creates calendar items.
- Audience can be ALL, STUDENT, TEACHER, or HOD, with optional department/semester scope.
- Students, Teachers, HODs receive only relevant calendar items.

## Assignments
- Teacher/HOD creates assignments only for subjects assigned to them.
- Assignments are delivered to students in that subject's department + semester.
- Principal does not have an assignment-management view.

## Leave flow
- Student → Class Teacher.
- Teacher → HOD.
- HOD → Principal.
- Approval is restricted to the correct approver and department/class.

## Dashboard visibility
- Student: personal academic information.
- Teacher: own teaching, timetable, attendance, assignments, notices, calendar.
- HOD: department management + own Teacher capabilities.
- Principal: campus administration, approvals, departments, teachers, students, leaves, calendar, notices, exams — not day-to-day assignments/timetable/attendance management.

## UX rule
After every successful create/update/delete/approve action, CampusOS refreshes the current data so the UI immediately reflects the change.
