-- CampusOS schema drift fix — OPTIONAL / MANUAL ALTERNATIVE
--
-- You don't need this file if you used the application.properties fix
-- (temporarily setting spring.jpa.hibernate.ddl-auto=create for one
-- restart, then back to update) — that already rebuilds every table
-- cleanly and makes this unnecessary.
--
-- Use this instead only if you don't want to wipe all data with a full
-- recreate. It patches the two orphaned columns found so far:
--   - subjects.admission_year          (belongs to students, not subjects)
--   - faculty_assignments.academic_year (not part of that entity at all)
--
-- These came from spring.jpa.hibernate.ddl-auto=update never dropping
-- stale columns from earlier versions of these entities. There may be
-- others on tables that haven't hit the error yet — the ddl-auto=create
-- approach above is the only way to be sure every table is clean, since
-- this file only fixes the two specific columns already found.

USE campusos;

ALTER TABLE subjects DROP COLUMN admission_year;
ALTER TABLE faculty_assignments DROP COLUMN academic_year;
