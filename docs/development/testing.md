# Testing

## Frontend Testing

```bash
cd frontend
npm test                # run all tests
npm test -- --watch     # watch mode
npm test -- AuthPage.test.tsx  # single file
```

- **Framework:** Jest with React Testing Library (when configured)
- **Scope:** Component tests, page routing tests, utility tests
- **Mocking:** API calls mocked via `jest.mock` / `msw`

### Linting

```bash
cd frontend
npm run lint
```

ESLint is configured via `eslint-config-next`.

## Backend Testing

```bash
cd backend
mvn test                              # all tests
mvn test -Dtest=AuthServiceTest       # single class
mvn verify                            # verify + JaCoCo coverage
```

- **Framework:** JUnit 5 + Mockito
- **Database:** H2 in-memory for repository tests
- **Coverage:** JaCoCo report generated on `mvn verify`

## Code Quality

- Keep tests deterministic and isolated
- New features must include unit tests
- Bug fixes should include a regression test
- Run the full test suite before submitting a PR

## CI

Tests run automatically on every push / pull request to `dev` and `main` via `.github/workflows/ci.yml`.
