# Plugin System

CampusOS uses a modular architecture where each major functionality is implemented as a separate module. While not a traditional plugin system, the architecture supports modular expansion.

## Module Structure

Each module follows the same layered pattern:

```
Module/
├── controller/   # REST endpoints
├── service/      # Business logic
├── repository/   # Data access (JPA)
├── entity/       # Database models
├── dto/          # Request/Response DTOs
├── enum/         # Status and type enums
└── util/         # Module-specific utilities
```

## Adding New Modules

To add a new feature/module:

1. **Create entity** - Define the JPA entity class
2. **Create repository** - Extend JpaRepository or CrudRepository
3. **Create DTOs** - Request and response data transfer objects
4. **Create service** - Implement business logic
5. **Create controller** - Expose REST endpoints
6. **Add frontend pages** - Implement corresponding UI views
7. **Update security** - Configure role-based access if needed

## Current Modules

Completed modules each follow this pattern independently. New modules can be added following the same structure without affecting existing functionality.

## Cross-Cutting Concerns

- **Security**: All modules use the same JWT authentication and role-based authorization
- **Exception handling**: Global exception handler covers all modules
- **Logging**: Consistent logging pattern across all services
- **Testing**: Each module has corresponding unit tests