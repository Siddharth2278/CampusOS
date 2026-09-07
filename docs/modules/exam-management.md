# Exam Management

> **Status:** Completed ✓

## Overview

Manages examination scheduling, assignment of exams to subjects/semesters, and related notifications.

## Entities

- `Exam` — exam record (subject, department, semester, date, type)
- `Exam` DTOs — request/response objects for creation and listing

## Backend

- **Controller:** `ExamController` — REST endpoints under `/api/exams`
- **Service:** `ExamService` — business logic, validation, scheduling rules
- **Repository:** `ExamRepository` — Spring Data JPA
- **Reminder:** `ExamReminderService` — scheduled notifications for upcoming exams

## Frontend

- Pages under `src/app/dashboard` for creating, listing, and viewing exams
- Role-based visibility: HOD / Teacher / Student views differ
- Calendar integration via `AcademicCalendar` module

## Access Control

- Only authorized roles (HOD, Teacher, Principal) can create/update exams
- Students have read-only access to their semester exams

## Related

- [Timetable](../backend-architecture.md) — exam dates respect timetable constraints
- [Notifications](../security/guidelines.md)
