# Authentication

CampusOS authentication follows a JWT-based security model with role-based access control.

## Signup

- New users register via the registration endpoint
- Password is hashed using bcrypt before storage
- Role is assigned based on registration type (Principal, HOD, Teacher, Student)
- Email verification may be required depending on configuration

## Login

- Users authenticate with email/username and password
- Successful authentication returns a signed JWT token
- Token includes user ID, role, and expiration timestamp
- Token is returned in JSON format: `{ token, user }`

## JWT Authentication

- Tokens are signed with a secure secret key (configured via JWT_SECRET env var)
- Token expiration configured via JWT_EXPIRATION env var (default: 24 hours)
- Token format: `Authorization: Bearer <jwt-token>`
- Every protected request includes the Bearer token in the Authorization header
- Server validates signature, expiration, and claims

## Protected Routes

- All backend endpoints except `/auth/**` require valid authentication
- Middleware intercepts requests and validates token before processing
- Invalid/missing token returns 401 Unauthorized
- Token refreshed upon refresh endpoint call

## Role/Permission Handling

- Users assigned one role: Principal, HOD, Teacher, or Student
- Role determines accessible endpoints and frontend pages
- HOD has additional department-scoped permissions
- Permissions checked at both frontend (page-level) and backend (endpoint-level)

## Password Management

- Password change available for all authenticated users
- Old password required for change operation
- Password reset via email link (Token-based)
- No password retrieval - only reset functionality

## Rate Limiting

- API endpoints protected against brute-force attacks
- Configurable limits per endpoint and per IP/user
- Exponential backoff on repeated failures