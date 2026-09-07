# Contributing to CampusOS

Thank you for considering contributing to CampusOS! This guide helps you get started with contributing to this project.

## 🌟 Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 🛠 Development Workflow

### 1. Fork the Repository

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/CampusOS.git
   cd CampusOS
   ```

### 2. Create a Branch

Create a new branch for your feature/fix:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/your-bug-name
```

### 3. Development Setup

Follow the [Setup](docs/development/setup.md) guide to get the project running locally.

### 4. Make Your Changes

- Follow the existing code style and conventions
- Add appropriate unit tests for new functionality
- Update documentation if needed
- Ensure all tests pass

### 5. Commit Your Changes

Follow commit message conventions:

```text
type: concise description

# Examples:
feat: add department management module
fix: correct JWT token validation bug
docs: update README with installation instructions
refactor: improve service layer error handling
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then navigate to your fork on GitHub and create a Pull Request against the `dev` branch of the original repository.

## 📋 Pull Request Process

1. **Fill the PR template** - Use the template in `.github/PULL_REQUEST_TEMPLATE/`
2. **Link issues** - If fixing an issue, link it using `Fixes #issue-number` or `Closes #issue-number`
3. **Address feedback** - Respond to reviewer comments and make requested changes
4. **Wait for CI** - Ensure all CI checks pass
5. **Merge** - Once approved, a maintainer will merge your PR

## 🐛 Issue Reporting

Use the issue templates in `.github/ISSUE_TEMPLATE/`:
- **Bug report** - For unexpected behavior or errors
- **Feature request** - For new functionality or improvements

Provide as much detail as possible:
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, browser, version)
- Error logs if applicable

## 📝 Coding Expectations

### Java (Backend)

- Follow Java Code Conventions
- Use meaningful variable and method names
- Document public methods with Javadoc
- Keep methods focused and single-purpose
- Use dependency injection appropriately
- Handle exceptions gracefully

### TypeScript/React (Frontend)

- Use TypeScript with strict mode
- Components should be pure where possible
- Follow the existing component patterns
- Add JSDoc for complex types
- Use Tailwind CSS for styling

## 🧪 Testing Expectations

- **New features** must include unit tests
- **Bug fixes** should include a test that verifies the fix
- Run the full test suite before submitting a PR
- Ensure both frontend (`npm test`) and backend (`mvn test`) tests pass

## 📄 Documentation Expectations

- Update README if API endpoints or setup changes
- Add or update docs in `docs/` directory if new concepts are introduced
- Keep environment examples current
- Document any new environment variables

## 🚫 Code of Conduct

- No harassment or discrimination
- Respect diverse perspectives and experiences
- Gracefully accept constructive criticism
- Focus on what's best for the community

## ❓ Need Help?

- Open an issue for questions about contributing
- Check the [documentation](docs/) for answers
- Review existing PRs to understand the review process

Thank you for contributing to CampusOS! 🎓