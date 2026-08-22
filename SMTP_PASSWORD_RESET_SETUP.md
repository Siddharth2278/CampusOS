# CampusOS Forgot Password SMTP Setup

CampusOS password reset uses SMTP through Gmail on port 587 with STARTTLS.

Set these backend environment variables before starting Spring Boot:

```powershell
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="yourgmail@gmail.com"
$env:MAIL_PASSWORD="your-16-character-google-app-password"
```

Then start:

```powershell
cd "D:\vs code\internship project\CampusOS\backend"
.\mvnw.cmd clean spring-boot:run
```

Important:
- `MAIL_PASSWORD` must be a Google App Password, not your normal Gmail password.
- Google requires 2-Step Verification before App Passwords can be created.
- The SMTP server is `smtp.gmail.com`, port `587`, with STARTTLS and authentication.
- The email used in the forgot-password form must already exist in the CampusOS `users` table.

After the OTP is delivered:
1. Enter the 6-digit OTP.
2. Verify it.
3. Set the new password.
4. Sign in with the new password.
