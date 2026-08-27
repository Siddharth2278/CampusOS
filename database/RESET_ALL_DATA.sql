-- CampusOS clean-start reset (single institution, no college table)
-- WARNING: this permanently deletes all CampusOS application data.
-- Run once before entering data from the frontend.

-- MySQL (local dev)
-- USE campusos;
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE assignment_submissions;
-- TRUNCATE TABLE assignments;
-- TRUNCATE TABLE leave_requests;
-- TRUNCATE TABLE faculty_assignments;
-- TRUNCATE TABLE exams;
-- TRUNCATE TABLE academic_calendar;
-- TRUNCATE TABLE timetable;
-- TRUNCATE TABLE notices;
-- TRUNCATE TABLE notifications;
-- TRUNCATE TABLE attendance;
-- TRUNCATE TABLE subjects;
-- TRUNCATE TABLE students;
-- TRUNCATE TABLE teachers;
-- TRUNCATE TABLE departments;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- PostgreSQL / Supabase (production) — single statement with CASCADE
TRUNCATE TABLE assignment_submissions, assignments, leave_requests, faculty_assignments, exams, academic_calendar, timetable, notices, notifications, attendance, subjects, students, teachers, departments, users CASCADE;
