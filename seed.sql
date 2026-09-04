-- CampusOS MySQL Seed Script
-- Run this in MySQL Workbench or: mysql -u root -p < seed.sql
-- Creates: 46 users, 3 departments, 9 teachers, 36 students, 18 subjects,
--          18 faculty assignments, 15 timetable entries, 3 assignments,
--          6 submissions, 6 exams, 4 notices, 4 calendar events, 6 leave requests

CREATE DATABASE IF NOT EXISTS campusos;
USE campusos;

-- All passwords are "password" (BCrypt)
SET @pw = '$2b$10$/r9TFsvUvwDNjJcc.U4TtOXa03BUFcEDyzJ308uLlUhS2jAey1H6y';

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (first_name, last_name, email, password, phone, role, status) VALUES
('Amit', 'Verma', 'principal@campus.edu', @pw, '9000000001', 'PRINCIPAL', 'APPROVED'),
('Rahul', 'Sharma', 'rahul.sharma@campus.edu', @pw, '9000000010', 'TEACHER', 'APPROVED'),
('Priya', 'Singh', 'priya.singh@campus.edu', @pw, '9000000011', 'TEACHER', 'APPROVED'),
('Arun', 'Kumar', 'arun.kumar@campus.edu', @pw, '9000000012', 'TEACHER', 'APPROVED'),
('Neha', 'Gupta', 'neha.gupta@campus.edu', @pw, '9000000013', 'TEACHER', 'APPROVED'),
('Vikram', 'Patel', 'vikram.patel@campus.edu', @pw, '9000000014', 'TEACHER', 'APPROVED'),
('Sonia', 'Reddy', 'sonia.reddy@campus.edu', @pw, '9000000015', 'TEACHER', 'APPROVED'),
('Deepak', 'Joshi', 'deepak.joshi@campus.edu', @pw, '9000000016', 'TEACHER', 'APPROVED'),
('Kavita', 'Nair', 'kavita.nair@campus.edu', @pw, '9000000017', 'TEACHER', 'APPROVED'),
('Rohan', 'Mehta', 'rohan.mehta@campus.edu', @pw, '9000000018', 'TEACHER', 'APPROVED'),
('Anjali', 'Desai', 'anjali.desai@campus.edu', @pw, '9000000019', 'TEACHER', 'APPROVED'),
-- Students CSE Sem 1
('Suresh', 'Yadav', 'suresh.yadav@campus.edu', @pw, '9100000001', 'STUDENT', 'APPROVED'),
('Pooja', 'Mishra', 'pooja.mishra@campus.edu', @pw, '9100000002', 'STUDENT', 'APPROVED'),
-- Students CSE Sem 2
('Amit', 'Tiwari', 'amit.tiwari@campus.edu', @pw, '9100000003', 'STUDENT', 'APPROVED'),
('Nisha', 'Choudhary', 'nisha.choudhary@campus.edu', @pw, '9100000004', 'STUDENT', 'APPROVED'),
-- Students CSE Sem 3
('Ravi', 'Shankar', 'ravi.shankar@campus.edu', @pw, '9100000005', 'STUDENT', 'APPROVED'),
('Meena', 'Devi', 'meena.devi@campus.edu', @pw, '9100000006', 'STUDENT', 'APPROVED'),
-- Students CSE Sem 4
('Sanjay', 'Mishra', 'sanjay.mishra@campus.edu', @pw, '9100000007', 'STUDENT', 'APPROVED'),
('Geeta', 'Pandey', 'geeta.pandey@campus.edu', @pw, '9100000008', 'STUDENT', 'APPROVED'),
-- Students CSE Sem 5
('Manoj', 'Tripathi', 'manoj.tripathi@campus.edu', @pw, '9100000009', 'STUDENT', 'APPROVED'),
('Sunita', 'Rao', 'sunita.rao@campus.edu', @pw, '9100000010', 'STUDENT', 'APPROVED'),
-- Students CSE Sem 6
('Prakash', 'Raj', 'prakash.raj@campus.edu', @pw, '9100000011', 'STUDENT', 'APPROVED'),
('Kamini', 'Singh', 'kamini.singh@campus.edu', @pw, '9100000012', 'STUDENT', 'APPROVED'),
-- Students IT Sem 1
('Vishal', 'Verma', 'vishal.verma@campus.edu', @pw, '9200000001', 'STUDENT', 'APPROVED'),
('Ritu', 'Agarwal', 'ritu.agarwal@campus.edu', @pw, '9200000002', 'STUDENT', 'APPROVED'),
-- Students IT Sem 2
('Ankit', 'Saxena', 'ankit.saxena@campus.edu', @pw, '9200000003', 'STUDENT', 'APPROVED'),
('Pallavi', 'Mishra', 'pallavi.mishra@campus.edu', @pw, '9200000004', 'STUDENT', 'APPROVED'),
-- Students IT Sem 3
('Mohit', 'Garg', 'mohit.garg@campus.edu', @pw, '9200000005', 'STUDENT', 'APPROVED'),
('Shreya', 'Kapoor', 'shreya.kapoor@campus.edu', @pw, '9200000006', 'STUDENT', 'APPROVED'),
-- Students IT Sem 4
('Tarun', 'Bajaj', 'tarun.bajaj@campus.edu', @pw, '9200000007', 'STUDENT', 'APPROVED'),
('Nandini', 'Iyer', 'nandini.iyer@campus.edu', @pw, '9200000008', 'STUDENT', 'APPROVED'),
-- Students IT Sem 5
('Ashish', 'Chauhan', 'ashish.chauhan@campus.edu', @pw, '9200000009', 'STUDENT', 'APPROVED'),
('Divya', 'Bhatt', 'divya.bhatt@campus.edu', @pw, '9200000010', 'STUDENT', 'APPROVED'),
-- Students IT Sem 6
('Karan', 'Malhotra', 'karan.malhotra@campus.edu', @pw, '9200000011', 'STUDENT', 'APPROVED'),
('Tanya', 'Sinha', 'tanya.sinha@campus.edu', @pw, '9200000012', 'STUDENT', 'APPROVED'),
-- Students ECE Sem 1
('Nitin', 'Chandra', 'nitin.chandra@campus.edu', @pw, '9300000001', 'STUDENT', 'APPROVED'),
('Rashmi', 'Kulkarni', 'rashmi.kulkarni@campus.edu', @pw, '9300000002', 'STUDENT', 'APPROVED'),
-- Students ECE Sem 2
('Saurabh', 'Tiwari', 'saurabh.tiwari@campus.edu', @pw, '9300000003', 'STUDENT', 'APPROVED'),
('Payal', 'Jain', 'payal.jain@campus.edu', @pw, '9300000004', 'STUDENT', 'APPROVED'),
-- Students ECE Sem 3
('Yogesh', 'Pandey', 'yogesh.pandey@campus.edu', @pw, '9300000005', 'STUDENT', 'APPROVED'),
('Aarti', 'Srivastava', 'aarti.srivastava@campus.edu', @pw, '9300000006', 'STUDENT', 'APPROVED'),
-- Students ECE Sem 4
('Abhishek', 'Rai', 'abhishek.rai@campus.edu', @pw, '9300000007', 'STUDENT', 'APPROVED'),
('Sapna', 'Pandey', 'sapna.pandey@campus.edu', @pw, '9300000008', 'STUDENT', 'APPROVED'),
-- Students ECE Sem 5
('Pankaj', 'Dubey', 'pankaj.dubey@campus.edu', @pw, '9300000009', 'STUDENT', 'APPROVED'),
('Rekha', 'Yadav', 'rekha.yadav@campus.edu', @pw, '9300000010', 'STUDENT', 'APPROVED'),
-- Students ECE Sem 6
('Siddharth', 'Mishra', 'siddharth.mishra@campus.edu', @pw, '9300000011', 'STUDENT', 'APPROVED'),
('Usha', 'Pillai', 'usha.pillai@campus.edu', @pw, '9300000012', 'STUDENT', 'APPROVED');

-- ============================================================
-- DEPARTMENTS
-- ============================================================
INSERT INTO departments (name, code, description) VALUES
('Computer Science & Engineering', 'CSE', 'Core computing and software engineering'),
('Information Technology', 'IT', 'Applied computing and network technologies'),
('Electronics & Communication', 'ECE', 'VLSI, embedded systems, and communications');

-- ============================================================
-- TEACHERS (linked to user IDs 2-10, departments 1-3)
-- ============================================================
INSERT INTO teachers (teacher_id, first_name, last_name, email, phone, department_id, class_teacher, class_teacher_semester, hod, user_id) VALUES
('T001', 'Rahul', 'Sharma', 'rahul.sharma@campus.edu', '9000000010', 1, true, 1, true, 2),
('T002', 'Priya', 'Singh', 'priya.singh@campus.edu', '9000000011', 1, true, 2, false, 3),
('T003', 'Arun', 'Kumar', 'arun.kumar@campus.edu', '9000000012', 1, true, 3, false, 4),
('T004', 'Neha', 'Gupta', 'neha.gupta@campus.edu', '9000000013', 2, true, 1, true, 5),
('T005', 'Vikram', 'Patel', 'vikram.patel@campus.edu', '9000000014', 2, true, 2, false, 6),
('T006', 'Sonia', 'Reddy', 'sonia.reddy@campus.edu', '9000000015', 2, true, 3, false, 7),
('T007', 'Deepak', 'Joshi', 'deepak.joshi@campus.edu', '9000000016', 3, true, 1, true, 8),
('T008', 'Kavita', 'Nair', 'kavita.nair@campus.edu', '9000000017', 3, true, 2, false, 9),
('T009', 'Rohan', 'Mehta', 'rohan.mehta@campus.edu', '9000000018', 3, true, 3, false, 10);

-- Update HOD in departments
UPDATE departments SET hod_teacher_id = 1 WHERE id = 1;
UPDATE departments SET hod_teacher_id = 4 WHERE id = 2;
UPDATE departments SET hod_teacher_id = 7 WHERE id = 3;

-- Update user roles for HODs
UPDATE users SET role = 'HOD' WHERE id IN (2, 5, 8);

-- ============================================================
-- STUDENTS (2 per department per semester = 36)
-- User IDs start at 11
-- ============================================================
INSERT INTO students (enrollment_number, roll_number, first_name, last_name, email, phone, semester, admission_year, department_id, user_id) VALUES
-- CSE Sem 1-6
('CSE24001', 1, 'Suresh', 'Yadav', 'suresh.yadav@campus.edu', '9100000001', 1, 2024, 1, 11),
('CSE24002', 2, 'Pooja', 'Mishra', 'pooja.mishra@campus.edu', '9100000002', 1, 2024, 1, 12),
('CSE24003', 1, 'Amit', 'Tiwari', 'amit.tiwari@campus.edu', '9100000003', 2, 2024, 1, 13),
('CSE24004', 2, 'Nisha', 'Choudhary', 'nisha.choudhary@campus.edu', '9100000004', 2, 2024, 1, 14),
('CSE23001', 1, 'Ravi', 'Shankar', 'ravi.shankar@campus.edu', '9100000005', 3, 2023, 1, 15),
('CSE23002', 2, 'Meena', 'Devi', 'meena.devi@campus.edu', '9100000006', 3, 2023, 1, 16),
('CSE23003', 3, 'Sanjay', 'Mishra', 'sanjay.mishra@campus.edu', '9100000007', 4, 2023, 1, 17),
('CSE23004', 4, 'Geeta', 'Pandey', 'geeta.pandey@campus.edu', '9100000008', 4, 2023, 1, 18),
('CSE22001', 1, 'Manoj', 'Tripathi', 'manoj.tripathi@campus.edu', '9100000009', 5, 2022, 1, 19),
('CSE22002', 2, 'Sunita', 'Rao', 'sunita.rao@campus.edu', '9100000010', 5, 2022, 1, 20),
('CSE22003', 3, 'Prakash', 'Raj', 'prakash.raj@campus.edu', '9100000011', 6, 2022, 1, 21),
('CSE22004', 4, 'Kamini', 'Singh', 'kamini.singh@campus.edu', '9100000012', 6, 2022, 1, 22),
-- IT Sem 1-6
('IT24001', 1, 'Vishal', 'Verma', 'vishal.verma@campus.edu', '9200000001', 1, 2024, 2, 23),
('IT24002', 2, 'Ritu', 'Agarwal', 'ritu.agarwal@campus.edu', '9200000002', 1, 2024, 2, 24),
('IT24003', 1, 'Ankit', 'Saxena', 'ankit.saxena@campus.edu', '9200000003', 2, 2024, 2, 25),
('IT24004', 2, 'Pallavi', 'Mishra', 'pallavi.mishra@campus.edu', '9200000004', 2, 2024, 2, 26),
('IT23001', 1, 'Mohit', 'Garg', 'mohit.garg@campus.edu', '9200000005', 3, 2023, 2, 27),
('IT23002', 2, 'Shreya', 'Kapoor', 'shreya.kapoor@campus.edu', '9200000006', 3, 2023, 2, 28),
('IT23003', 3, 'Tarun', 'Bajaj', 'tarun.bajaj@campus.edu', '9200000007', 4, 2023, 2, 29),
('IT23004', 4, 'Nandini', 'Iyer', 'nandini.iyer@campus.edu', '9200000008', 4, 2023, 2, 30),
('IT22001', 1, 'Ashish', 'Chauhan', 'ashish.chauhan@campus.edu', '9200000009', 5, 2022, 2, 31),
('IT22002', 2, 'Divya', 'Bhatt', 'divya.bhatt@campus.edu', '9200000010', 5, 2022, 2, 32),
('IT22003', 3, 'Karan', 'Malhotra', 'karan.malhotra@campus.edu', '9200000011', 6, 2022, 2, 33),
('IT22004', 4, 'Tanya', 'Sinha', 'tanya.sinha@campus.edu', '9200000012', 6, 2022, 2, 34),
-- ECE Sem 1-6
('ECE24001', 1, 'Nitin', 'Chandra', 'nitin.chandra@campus.edu', '9300000001', 1, 2024, 3, 35),
('ECE24002', 2, 'Rashmi', 'Kulkarni', 'rashmi.kulkarni@campus.edu', '9300000002', 1, 2024, 3, 36),
('ECE24003', 1, 'Saurabh', 'Tiwari', 'saurabh.tiwari@campus.edu', '9300000003', 2, 2024, 3, 37),
('ECE24004', 2, 'Payal', 'Jain', 'payal.jain@campus.edu', '9300000004', 2, 2024, 3, 38),
('ECE23001', 1, 'Yogesh', 'Pandey', 'yogesh.pandey@campus.edu', '9300000005', 3, 2023, 3, 39),
('ECE23002', 2, 'Aarti', 'Srivastava', 'aarti.srivastava@campus.edu', '9300000006', 3, 2023, 3, 40),
('ECE23003', 3, 'Abhishek', 'Rai', 'abhishek.rai@campus.edu', '9300000007', 4, 2023, 3, 41),
('ECE23004', 4, 'Sapna', 'Pandey', 'sapna.pandey@campus.edu', '9300000008', 4, 2023, 3, 42),
('ECE22001', 1, 'Pankaj', 'Dubey', 'pankaj.dubey@campus.edu', '9300000009', 5, 2022, 3, 43),
('ECE22002', 2, 'Rekha', 'Yadav', 'rekha.yadav@campus.edu', '9300000010', 5, 2022, 3, 44),
('ECE22003', 3, 'Siddharth', 'Mishra', 'siddharth.mishra@campus.edu', '9300000011', 6, 2022, 3, 45),
('ECE22004', 4, 'Usha', 'Pillai', 'usha.pillai@campus.edu', '9300000012', 6, 2022, 3, 46);

-- ============================================================
-- SUBJECTS (3 per dept × 6 semesters = 18)
-- ============================================================
INSERT INTO subjects (name, code, department_id, semester, academic_year) VALUES
('Data Structures', 'CS101', 1, 1, '2024'),
('DBMS', 'CS102', 1, 2, '2024'),
('Operating Systems', 'CS201', 1, 3, '2024'),
('Computer Networks', 'CS202', 1, 4, '2024'),
('Software Engineering', 'CS301', 1, 5, '2024'),
('Machine Learning', 'CS302', 1, 6, '2024'),
('Web Technologies', 'IT101', 2, 1, '2024'),
('Cloud Computing', 'IT102', 2, 2, '2024'),
('Cyber Security', 'IT201', 2, 3, '2024'),
('IoT', 'IT202', 2, 4, '2024'),
('DevOps', 'IT301', 2, 5, '2024'),
('Blockchain', 'IT302', 2, 6, '2024'),
('Digital Electronics', 'EC101', 3, 1, '2024'),
('Signal Processing', 'EC102', 3, 2, '2024'),
('VLSI Design', 'EC201', 3, 3, '2024'),
('Embedded Systems', 'EC202', 3, 4, '2024'),
('Wireless Communication', 'EC301', 3, 5, '2024'),
('5G Technology', 'EC302', 3, 6, '2024');

-- ============================================================
-- FACULTY ASSIGNMENTS (teacher teaches subject)
-- Teacher IDs 1-3 → CSE subjects (IDs 1-6)
-- Teacher IDs 4-6 → IT subjects (IDs 7-12)
-- Teacher IDs 7-9 → ECE subjects (IDs 13-18)
-- ============================================================
INSERT INTO faculty_assignments (teacher_id, subject_id) VALUES
(1, 1), (1, 2),
(2, 3), (2, 4),
(3, 5), (3, 6),
(4, 7), (4, 8),
(5, 9), (5, 10),
(6, 11), (6, 12),
(7, 13), (7, 14),
(8, 15), (8, 16),
(9, 17), (9, 18);

-- ============================================================
-- TIMETABLE (15 entries: 5 per department, semester 1)
-- ============================================================
INSERT INTO timetable (department_id, semester, day, lecture_number, session_type, subject_id, teacher_id, start_time, end_time) VALUES
(1, 1, 'MONDAY', 1, 'LECTURE', 1, 1, '09:00', '09:50'),
(1, 1, 'MONDAY', 2, 'LECTURE', 2, 1, '09:50', '10:40'),
(1, 1, 'TUESDAY', 1, 'PRACTICAL', 1, 1, '09:00', '10:00'),
(1, 1, 'WEDNESDAY', 1, 'LECTURE', 1, 1, '09:00', '09:50'),
(1, 1, 'THURSDAY', 1, 'LECTURE', 2, 1, '09:00', '09:50'),
(2, 1, 'MONDAY', 1, 'LECTURE', 7, 4, '09:00', '09:50'),
(2, 1, 'MONDAY', 2, 'LECTURE', 8, 4, '09:50', '10:40'),
(2, 1, 'TUESDAY', 1, 'PRACTICAL', 7, 4, '09:00', '10:00'),
(2, 1, 'WEDNESDAY', 1, 'LECTURE', 7, 4, '09:00', '09:50'),
(2, 1, 'THURSDAY', 1, 'LECTURE', 8, 4, '09:00', '09:50'),
(3, 1, 'MONDAY', 1, 'LECTURE', 13, 7, '09:00', '09:50'),
(3, 1, 'MONDAY', 2, 'LECTURE', 14, 7, '09:50', '10:40'),
(3, 1, 'TUESDAY', 1, 'PRACTICAL', 13, 7, '09:00', '10:00'),
(3, 1, 'WEDNESDAY', 1, 'LECTURE', 13, 7, '09:00', '09:50'),
(3, 1, 'THURSDAY', 1, 'LECTURE', 14, 7, '09:00', '09:50');

-- ============================================================
-- ASSIGNMENTS (3 total)
-- ============================================================
INSERT INTO assignments (title, description, due_date, subject_id, teacher_id, created_at, expired) VALUES
('Lab Report 1', 'Write a lab report on Arrays and Linked Lists', '2026-09-15 23:59:59', 1, 1, NOW(), false),
('DBMS Project', 'Design a normalized database for a library system', '2026-09-20 23:59:59', 2, 1, NOW(), false),
('OS Case Study', 'Study and present on CPU scheduling algorithms', '2026-09-10 23:59:59', 3, 2, NOW(), false);

-- ============================================================
-- ASSIGNMENT SUBMISSIONS (2 per assignment = 6)
-- ============================================================
INSERT INTO assignment_submissions (assignment_id, student_id, status, submitted_at, remarks) VALUES
(1, 1, 'SUBMITTED', NOW(), 'Good work'),
(1, 2, 'NOT_SUBMITTED', NULL, NULL),
(2, 1, 'SUBMITTED', NOW(), NULL),
(2, 2, 'NOT_SUBMITTED', NULL, NULL),
(3, 3, 'SUBMITTED', NOW(), NULL),
(3, 4, 'NOT_SUBMITTED', NULL, NULL);

-- ============================================================
-- EXAMS (6 total, 2 per department)
-- ============================================================
INSERT INTO exams (exam_name, exam_type, subject_id, department_id, semester, exam_date, start_time, end_time, room, academic_year, created_by_user_id, created_by_name) VALUES
('Mid-Term CSE Sem1', 'MIDTERM', 1, 1, 1, '2026-10-01', '10:00', '12:00', 'Room 101', '2026', 1, 'Amit Verma'),
('End-Term CSE Sem1', 'ENDTERM', 1, 1, 1, '2026-12-15', '10:00', '13:00', 'Room 101', '2026', 1, 'Amit Verma'),
('Mid-Term IT Sem1', 'MIDTERM', 7, 2, 1, '2026-10-01', '10:00', '12:00', 'Room 201', '2026', 1, 'Amit Verma'),
('End-Term IT Sem1', 'ENDTERM', 7, 2, 1, '2026-12-15', '10:00', '13:00', 'Room 201', '2026', 1, 'Amit Verma'),
('Mid-Term ECE Sem1', 'MIDTERM', 13, 3, 1, '2026-10-01', '10:00', '12:00', 'Room 301', '2026', 1, 'Amit Verma'),
('End-Term ECE Sem1', 'ENDTERM', 13, 3, 1, '2026-12-15', '10:00', '13:00', 'Room 301', '2026', 1, 'Amit Verma');

-- ============================================================
-- NOTICES (4)
-- ============================================================
INSERT INTO notices (title, description, receiver_role, priority, department_id, semester, target_user_id, attachment_url, attachment_file_name, created_by, created_at, expiry_date) VALUES
('Mid-Term Schedule', 'Mid-term exams start from Oct 1. Check your individual schedules.', 'ALL', 'IMPORTANT', NULL, NULL, NULL, NULL, NULL, 1, NOW(), NULL),
('Lab Report Submission', 'All CSE Sem1 students must submit Lab Report 1 by Sept 15.', 'STUDENT', 'URGENT', 1, 1, NULL, NULL, NULL, 2, NOW(), NULL),
('Faculty Meeting', 'Monthly faculty meeting on Sept 20 at 3 PM in Conference Room.', 'TEACHER', 'NORMAL', NULL, NULL, NULL, NULL, NULL, 1, NOW(), NULL),
('Welcome Back', 'Welcome to the new academic year 2026-27!', 'ALL', 'NORMAL', NULL, NULL, NULL, NULL, NULL, 1, NOW(), NULL);

-- ============================================================
-- ACADEMIC CALENDAR (4 events)
-- ============================================================
INSERT INTO academic_calendar (title, description, type, audience, department_id, semester, venue, event_date, start_time, end_time, created_by, created_at, expired) VALUES
('Independence Day', 'College closed for Independence Day', 'HOLIDAY', 'ALL', NULL, NULL, 'Campus', '2026-08-15', NULL, NULL, 1, CURDATE(), false),
('Tech Symposium', 'Annual technical symposium - paper presentations and workshops', 'WORKSHOP', 'ALL', NULL, NULL, 'Main Auditorium', '2026-09-25', '09:00', '17:00', 1, CURDATE(), false),
('Placement Drive', 'Campus recruitment drive by TechCorp', 'PLACEMENT', 'ALL', NULL, NULL, 'Seminar Hall', '2026-10-10', '10:00', '16:00', 1, CURDATE(), false),
('Semester Exams Begin', 'End-semester examinations commence', 'EXAM', 'ALL', NULL, NULL, 'Exam Hall', '2026-12-01', NULL, NULL, 1, CURDATE(), false);

-- ============================================================
-- LEAVE REQUESTS (6)
-- ============================================================
INSERT INTO leave_requests (user_id, leave_role, leave_type, reason, start_date, end_date, status, approver_role, assigned_approver_id, approved_by, approved_at, created_at, remarks) VALUES
(11, 'STUDENT', 'SICK', 'Fever and cold', '2026-09-01', '2026-09-02', 'PENDING', 'CLASS_TEACHER', 2, NULL, NULL, NOW(), NULL),
(13, 'STUDENT', 'CASUAL', 'Family function', '2026-09-05', '2026-09-06', 'APPROVED', 'CLASS_TEACHER', 2, 2, NOW(), NOW(), 'Approved'),
(23, 'STUDENT', 'PERSONAL', 'Personal work', '2026-09-03', '2026-09-03', 'REJECTED', 'CLASS_TEACHER', 5, 5, NOW(), NOW(), 'Insufficient notice'),
(2, 'TEACHER', 'MEDICAL', 'Doctor appointment', '2026-09-10', '2026-09-10', 'PENDING', 'HOD', 2, NULL, NULL, NOW(), NULL),
(5, 'TEACHER', 'CASUAL', 'Personal errand', '2026-09-12', '2026-09-12', 'APPROVED', 'HOD', 5, 5, NOW(), NOW(), 'Approved'),
(8, 'HOD', 'DUTY', 'Conference attendance', '2026-09-20', '2026-09-22', 'PENDING', 'PRINCIPAL', 1, NULL, NULL, NOW(), NULL);

-- Done!
SELECT 'Seed data inserted successfully!' AS status;
