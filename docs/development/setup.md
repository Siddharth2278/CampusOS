# Development

## Setup

### Prerequisites

- Node.js 20.x or higher
- Java 25 JDK
- PostgreSQL 15+ with created database
- Git

### Frontend Setup

```bash
# Clone and navigate
git clone https://github.com/NITRR-Official/CampusOS.git
cd CampusOS/frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```
Available at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend
cd ../backend

# Install dependencies
mvn install

# Copy environment variables
cp .env.example .env

# Run the application
mvn spring-boot:run
```
Available at `http://localhost:8080`

### Database Initialization

1. Create a PostgreSQL database named `campusos` (or configure custom name)
2. Update `backend/.env` with database connection string
3. Run schema initialization scripts (if applicable)
4. Seed initial data using provided scripts

### First-Time Setup Complete

- Register the first user (Principal role) via the registration endpoint
- Log in to the frontend with the newly created credentials
- Begin configuring departments, users, and modules

## Next Steps

- See [API Standards](api-standards.md) for endpoint conventions
- See [Testing](testing.md) for running tests and linting