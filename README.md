# CampusOS

> A full-stack college management platform for managing academic, administrative, and student operations from one system.

## 🚀 Overview

CampusOS is a role-based college management system designed to centralize day-to-day academic workflows for principals, HODs, teachers, and students.

The project is built as a modular full-stack application with separate frontend, backend, and database layers.

## ✨ Key Features

- 🔐 Role-based authentication and authorization
- 👨‍🎓 Student management
- 👨‍🏫 Teacher and faculty management
- 🏫 Department and subject management
- 📚 Faculty assignment
- 📝 Attendance management
- 🗓️ Timetable management
- 📢 Role-based notice management
- 📅 Academic calendar
- 🏖️ Leave management
- 🧾 Complaint management
- 📝 Examination management
- 📊 Role-specific dashboards
- 🔑 OTP/password-reset workflows

## 🏗️ Architecture

```text
CampusOS/
├── backend/      # REST API and business logic
├── frontend/     # Web application and UI
├── database/     # Database-related resources
├── seed.sql      # Initial/demo database data
└── docs/         # Project documentation
```

The application follows a layered architecture so that presentation, business logic, persistence, and database concerns remain separated.

## 🛠️ Technology Stack

### Backend
- Java
- Spring Boot
- Spring Security
- REST APIs
- JPA / Hibernate

### Frontend
- React
- JavaScript
- HTML / CSS

### Database
- MySQL

### Development
- Git & GitHub
- Postman
- Maven

## 🔄 Request Flow

```text
User
  ↓
React Frontend
  ↓
REST API
  ↓
Spring Security
  ↓
Controller
  ↓
Service Layer
  ↓
Repository Layer
  ↓
MySQL Database
```

## 🔐 Security

CampusOS uses authentication and role-based authorization to control access to protected resources. Credentials and authentication tokens are handled through the application's security layer rather than being exposed in the frontend.

## 📌 Project Status

CampusOS is an actively developed project. Features are implemented incrementally, tested through API workflows, and organized into independent modules.

## 🎯 Goals

- Reduce manual college administration work
- Centralize academic information
- Provide role-specific workflows
- Improve communication between college roles
- Build a maintainable and scalable college management platform

## 👨‍💻 Author

**Siddharth Naikade**

GitHub: [@Siddharth2278](https://github.com/Siddharth2278)
