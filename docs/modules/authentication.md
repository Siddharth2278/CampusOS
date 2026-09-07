# Authentication Module

## Overview

Handles user registration, login, JWT issuance, password hashing, and role-based authorization.

## Flows

### Registration

- `POST /api/auth/register` — creates a new user
- Password hashed with BCrypt before persistence
- Role assigned at registration (`STUDENT`, `TEACHER`, `HOD`, `PRINCIPAL`)
- Constraints: exactly one `PRINCIPAL` per system, one `HOD` per department

### Login

- `POST /api/auth/login` — returns `{ token, user }`
- Token is a signed JWT containing user ID, role, and expiry
- Client stores token and sends `Authorization: Bearer <token>` on subsequent requests

### Password Management

- `POST /api/auth/forgot-password` — sends reset link via email (SMTP)
- `POST /api/auth/reset-password` — validates token and updates password
- Authenticated `POST /api/auth/change-password` — requires old password

## Security Components

- `JwtAuthenticationFilter` — validates token on every request
- `SecurityConfig` — defines public vs protected routes, CORS, CSRF settings
- `CustomUserDetailsService` — loads user for Spring Security

## Frontend Integration

- `src/context/AuthContext` — global auth state
- Protected routes redirect unauthenticated users to `/login`
- Token persisted in `localStorage` / `sessionStorage` with tab-session isolation

## Related Docs

- [Backend Architecture](../backend-architecture.md)
- [Security — Authentication](../security/authentication.md)
