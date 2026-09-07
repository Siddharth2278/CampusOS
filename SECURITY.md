# Security Policy

## Supported Versions

Use this section to tell people about supported versions of your project. Tell them about the current version's support window and the security fix window.

## Reporting Vulnerabilities

If you discover a security vulnerability in CampusOS, we appreciate your help in responsibly disclosing it. Please do NOT report security vulnerabilities via public GitHub issues.

### How to Report

Please send an email to **security@campusos.example.com** with the subject "Security Vulnerability Report - CampusOS".

### What to Include

- Type of vulnerability (e.g., SQL injection, XSS, authentication bypass)
- Affected components or endpoints
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

### Response Timeline

- **Initial response**: Within 5 business days
- ** triage**: Within 10 business days
- **Fix deployment**: Timeline depends on severity (critical: 72 hours, high: 2 weeks, medium: 1 month, low: 3 months)

### Security Essentials

- **Do not publicly disclose** vulnerabilities before they are addressed
- **Do not include** secrets, passwords, or private keys in your report
- **Expect** a professional and timely response from the maintainers

## Recommended Practices

### For Contributors

- Never commit secrets, API keys, or JWT secrets to the repository
- Use environment variables for all sensitive configuration
- Run `git status` before committing to ensure no `.env` files are included
- Follow the [Security Guidelines](docs/security/guidelines.md)

### For Users

- Keep your `.env` files local and never share them
- Use strong, unique passwords for your accounts
- Regularly rotate JWT secrets and credentials
- Report suspected security issues via the email above

## Contact

For security-related inquiries, contact: security@campusos.example.com

**Note**: Do not include private contact information that could be publicly exposed.