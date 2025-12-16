# Contributing to Azure Booking Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

Please refer to the main [README.md](README.md) for detailed local development setup instructions.

## Code Style

### Frontend (TypeScript/React)
- Follow the ESLint configuration provided
- Use functional components with hooks
- Use TypeScript strict mode
- Import types separately: `import type { Type } from 'module'`

### Backend (.NET)
- Follow C# naming conventions
- Use async/await for all I/O operations
- Keep functions focused and single-purpose
- Use dependency injection

### Infrastructure (Terraform)
- Run `terraform fmt` before committing
- Keep resources logically organized
- Use variables for configurable values
- Add comments for complex configurations

## Commit Messages

Use clear, descriptive commit messages:
- Start with a verb in present tense (Add, Fix, Update, etc.)
- Keep the first line under 50 characters
- Add detailed description if needed

Examples:
- `Add appointment notification feature`
- `Fix date range validation in booking form`
- `Update Terraform Azure provider to v4.0`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with appropriate tests
3. Ensure all builds and tests pass
4. Update documentation as needed
5. Submit a pull request with a clear description

## Testing

- Frontend: Run `npm test` in the `web/` directory
- Backend: Run `dotnet test` in the `api/` directory
- Terraform: Run `terraform validate` in `infra/terraform/`

## Questions?

Feel free to open an issue for any questions or discussions.
