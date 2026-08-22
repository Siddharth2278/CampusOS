# CampusOS AI + Profile + OTP Setup

## AI
Set on the Spring Boot backend:
`GEMINI_API_KEY=your_google_ai_studio_api_key`
`GEMINI_MODEL=gemini-2.5-flash`

The API key stays on the backend. The frontend calls `POST /api/ai/chat`.

## Email OTP
Set:
`MAIL_HOST=smtp.gmail.com`
`MAIL_PORT=587`
`MAIL_USERNAME=yourgmail@gmail.com`
`MAIL_PASSWORD=your_gmail_app_password`

Use a Gmail App Password, not the normal Gmail password.

## Profile
The separate sidebar "My Profile" item is removed. The top-right account card is clickable and opens `/profile`, where the user can edit first name, last name, email, phone, and change password.

## Deployment
Vercel frontend:
`NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL`

Render backend:
add the Gemini and mail variables in Render Environment settings.

Existing CampusOS modules/routes are kept; the new AI, profile, and OTP APIs are additive.


