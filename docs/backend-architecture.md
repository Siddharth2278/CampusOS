# Backend Architecture

CampusOS backend is built as a Spring Boot application following a layered architecture with clear separation of concerns.

## Layered Architecture

```
Controller Layer
   ↓
Service Layer
   ↓
Repository Layer
   ↓
Database (PostgreSQL)
```

## Key Components

### Controllers (`com.campusos.backend.controller`)

REST endpoints for all user roles (Principal, HOD, Teacher, Student). Each controller handles HTTP requests and delegates business logic to the service layer.

### Services (`com.campusos.backend.service`)

Business logic implementation. Services contain the core operational rules and orchestrate data flow between repositories and controllers.

### Repositories (`com.campusos.backend.repository`)

Spring Data JPA interfaces providing CRUD operations for all entities. No custom implementation required for basic operations.

### Security (`com.campusos.backend.security`)

- JWT Authentication Filter: Intercepts incoming requests, validates JWT tokens, sets authentication context
- Security Config: HTTP security configuration, CORS, csrf exemption for auth endpoints
- Custom User Details Service: Loads user details from database for Spring Security authentication

### Configuration (`com.campusos.backend.config`)

- SecurityConfig: Core security filter chain configuration
- CORS configuration for frontend integration
- MailConfig: Email service configuration for password resets and notifications
- GlobalExceptionHandler: Centralized exception handling
- SeedData: Initial data population scripts

## Transaction Management

All service methods that modify data are annotated with `@Transactional` ensuring atomicity and consistency.

## Exception Handling

Global exception handler provides consistent error responses across all endpoints. Custom exceptions include appropriate HTTP status codes and error messages.

## Database

PostgreSQL is the primary database. JPA/Hibernate manages schema generation and migrations. Entity classes map directly to database tables.