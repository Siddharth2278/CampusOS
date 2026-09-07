# CampusOS 🏫

> A full-stack college management platform for centralizing academic, administrative, and student operations in one role-based system.

[![Java](https://img.shields.io/badge/Java-17%2B-orange?logo=openjdk)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/Status-Active%20Development-blue)](#project-status)

## 📌 Overview

CampusOS is a modular college management system designed to bring common academic and administrative workflows into a single platform. It provides role-specific functionality for principals, HODs, teachers, and students while keeping business logic, security, persistence, and presentation concerns separated.

### 👥 Core Roles

| Role | Purpose |
|---|---|
| **Principal** | Institution-wide administration and communication |
| **HOD** | Department-level academic and administrative management |
| **Teacher** | Teaching, attendance, timetable, notices, and academic workflows |
| **Student** | Academic information, attendance, notices, leave, complaints, and exams |

## ✨ Key Features

- 🔐 Authentication, authorization, OTP, and password-reset workflows
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

## 🏗️ Architecture

```text
┌───────────────────┐
│   React Frontend  │
└─────────┬─────────┘
          │ HTTP / JSON
          ▼
┌───────────────────┐
│  Spring Boot API  │
├───────────────────┤
│ Controllers       │
│ Services          │
│ Security          │
│ Repositories      │
└─────────┬─────────┘
          │ JPA / Hibernate
          ▼
┌───────────────────┐
│      MySQL        │
└───────────────────┘
```

## 🔄 Request Flow

```text
User
  ↓
React UI
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
MySQL
```

## 🛠️ Technology Stack

### Backend
- Java
- Spring Boot
- Spring Security
- REST APIs
- JPA / Hibernate
- Maven

### Frontend
- React
- JavaScript
- HTML / CSS

### Database
- MySQL

### Development & Testing
- Git & GitHub
- Postman
- IntelliJ IDEA / VS Code

## 📁 Project Structure

```text
CampusOS/
├── backend/      # Spring Boot REST API and business logic
├── frontend/     # React web application
├── database/     # Database resources
├── seed.sql      # Initial/demo database data
└── docs/         # Project documentation
```

## 🔐 Security

CampusOS uses a dedicated security layer for authentication and role-based authorization. Protected resources are controlled by backend authorization rules, while credentials and authentication tokens are handled by the application's security mechanisms rather than being exposed as application data.

## 🧩 Modules

The system is developed incrementally as independent modules, including authentication, department and subject management, student and teacher management, faculty assignment, attendance, timetable, notices, academic calendar, leave, complaints, and examination management.

## 📌 Project Status

**Active development** — modules are implemented incrementally, tested through API workflows, and integrated into the overall platform.

## 🎯 Goals

- Reduce manual college administration work
- Centralize academic information
- Provide role-specific workflows
- Improve communication across college roles
- Maintain a modular and scalable architecture

## 👨‍💻 Author

**Siddharth Naikade**

GitHub: [@Siddharth2278](https://github.com/Siddharth2278)

---

⭐ If you find CampusOS interesting, consider giving the repository a star.
