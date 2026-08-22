-- CampusOS clean-start reset
-- Run this once against the campusos database before entering data from the frontend.
-- WARNING: this permanently deletes all CampusOS application data.

USE campusos;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE assignment_submissions;
TRUNCATE TABLE assignments;
TRUNCATE TABLE leave_requests;
TRUNCATE TABLE faculty_assignments;
TRUNCATE TABLE exams;
TRUNCATE TABLE academic_calendar;
TRUNCATE TABLE timetable;
TRUNCATE TABLE notices;
TRUNCATE TABLE notifications;
TRUNCATE TABLE attendance;
TRUNCATE TABLE subjects;
TRUNCATE TABLE students;
TRUNCATE TABLE teachers;
TRUNCATE TABLE departments;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;
