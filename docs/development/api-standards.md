# API Standards

## Base URL

```
http://localhost:8080/api
```

Production base URL is configured via `NEXT_PUBLIC_API_URL`.

## Authentication

- All protected endpoints require `Authorization: Bearer <jwt-token>` header
- Public endpoints: `/api/auth/**` (login, register, forgot-password, reset)
- Unauthenticated access returns `401 Unauthorized`
- Token is obtained from `POST /api/auth/login`

## Request / Response Format

- **JSON** for all requests and responses
- **UTF-8** encoding
- Standard HTTP verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Standard HTTP status codes: `200`, `201`, `400`, `401`, `403`, `404`, `500`

### Success Response

```json
{
  "success": true,
  "data": { "...": "..." },
  "message": "Optional message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable message"
}
```

Handled centrally by `GlobalExceptionHandler` in the backend.

## Pagination, Sorting & Filtering

- Query parameters: `page`, `size`, `sortBy`, `sortDir`
- Filtering via query params, e.g. `?departmentId=1&status=ACTIVE`
- Backend validates and sanitizes all parameters

## Versioning

Current API is served under `/api`. Future breaking changes will be versioned as `/api/v2` while maintaining backward compatibility for `/api`.

## Validation

- Request DTOs validated with Jakarta Bean Validation (`@Valid`, `@NotBlank`, etc.)
- Validation errors return `400 Bad Request` with field-level details
