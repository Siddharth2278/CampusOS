# Frontend Architecture

CampusOS frontend is built with Next.js 16.3.0 and React 19.2.8 using TypeScript and Tailwind CSS 4.

## Directory Structure

```
src/app/        # Page routing (Next.js 13+ App Router)
src/components/ # Reusable UI components
src/context/    # React contexts (AuthContext)
src/lib/        # Utilities, API client, types
src/types/      # TypeScript type definitions
```

## Routing Structure

### Auth Pages

- `/login` - User login page
- `/register` - New user registration
- `/forgot-password` - Password recovery

### Dashboard Views

- `/` - Principal dashboard (campus-level overview)
- `/student` - Student dashboard (courses, attendance, assignments)
- `/teacher` - Teacher dashboard (classes, assignments, grading)
- `/hod` - HOD dashboard (department management, faculty assignments)

### Feature Pages

- Assignments, Attendance, Calendar, Complaints
- Directory, Exams, Leaves, Notices
- Profile, Settings

## State Management

- **AuthContext**: Global authentication state (login status, user role, token)
- Local component state for UI interactions
- API responses handled via React Server Components and Client Components

## Styling

- **Tailwind CSS 4**: Utility-first styling
- **framer-motion**: Page transitions and micro-interactions
- **lucide-react**: Icon set

## API Client

Fetch-based API calls to backend endpoints. Automatic JSON parsing. Error handling utilities for consistent response processing.

## Form Handling

- Yup or Zod for schema validation
- React Controller for controlled form components
- Error state management per field