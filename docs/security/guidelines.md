# Security Guidelines

## General Security Principles

- **Never commit secrets**: API keys, JWT secrets, database credentials, and passwords must never be committed to the repository
- **Use environment variables**: All sensitive configuration via `.env` files added to `.gitignore`
- **HTTPS in production**: All external communication should use TLS/SSL
- **Input validation**: All user inputs validated on both frontend and backend
- **Least privilege**: Users granted minimum necessary permissions for their role

## Authentication Security

- **Password hashing**: BCrypt with appropriate work factor. Never store plaintext passwords.
- **JWT short expiration**: Access tokens have limited lifespan (24h default)
- **Token rotation**: Refresh token mechanism where applicable
- **Password policies**: Minimum length, complexity requirements

## Database Security

- **Connection pooling**: Configured HikariCP with maximum pool size
- **Prepared statements**: All queries use parameterized statements to prevent SQL injection
- **Schema isolation**: Separate schemas or databases per environment where applicable

## API Security

- **Rate limiting**: All public endpoints limited to prevent abuse
- **CORS configuration**: Restricted to known frontend origins only
- **Request size limits**: Maximum payload size enforced
- **CSRF protection**: Where applicable, CSRF tokens for state-changing requests

## Security Best Practices

- Keep dependencies updated (Maven/Gradle plugins)
- Use security-focused libraries (Spring Security, Bcrypt)
- Regular dependency vulnerability scans
- Secure error messages - no stack traces in production
- Logging of security-relevant events (login failures, token rejections)
- GDPR/privacy compliance for user data

## Reporting Security Issues

See [SECURITY.md](SECURITY.md) for vulnerability reporting procedures.