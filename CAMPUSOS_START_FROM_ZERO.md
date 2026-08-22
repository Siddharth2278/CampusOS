# CampusOS — Clean Start

## 1. Reset the existing database
Open MySQL Workbench, select the `campusos` database, and run:

`database/RESET_ALL_DATA.sql`

This deletes application data but keeps the database schema.

## 2. Start backend
From `backend`:

`mvnw.cmd spring-boot:run`

## 3. Start frontend
From `frontend`:

`npm install`
`npm run dev`

## 4. Enter CampusOS from the frontend

### Step A — Principal
Register exactly one Principal.

### Step B — Departments
Login as Principal and create departments.

### Step C — Bootstrap HOD
For each department:
1. A teacher registers from the public registration page.
2. The teacher selects that department.
3. The request appears in Principal → Approvals because the department has no HOD.
4. Principal approves the teacher.
5. Principal → Directory → HOD Management selects that department.
6. Principal selects one approved teacher and assigns HOD.
7. That department now has exactly one HOD.

### Step D — Normal teacher registration
After a department has an HOD:
1. Teacher registers and selects the department.
2. The request goes to that department's HOD.
3. The HOD approves/rejects it.

Principal does not create ordinary teacher accounts.

### Step E — HOD setup
The HOD:
1. Creates department subjects.
2. Assigns multiple subjects to teachers.
3. Can edit/delete faculty assignments.
4. Assigns one Class Teacher for each semester.
5. Builds the department timetable using HOD subject assignments.

### Step F — Student registration
1. Student registers with department + semester.
2. HOD must first assign a Class Teacher for that semester.
3. The registration appears only for that Class Teacher.
4. Class Teacher approves/rejects the student.

## 5. Password
Every role has `Change password` in its dashboard.

## 6. Refresh
Successful create/update/delete/approval operations trigger a CampusOS data refresh.

## 7. Important
Do not manually insert users, teachers, HODs, subjects or faculty assignments into MySQL for the clean test. Enter the initial data through the frontend so the complete approval and authority flow is tested.
