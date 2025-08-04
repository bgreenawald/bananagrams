# Code Quality Setup Guide

This document describes the comprehensive code quality tooling that has been set up for the Bananagrams project.

## Overview

The project now includes:
- **Pre-commit hooks** for automatic code quality checks
- **GitHub Actions workflows** for CI/CD
- **Modern tool configurations** for both Python and TypeScript/Vue
- **VSCode integration** for optimal development experience
- **Makefile commands** for common development tasks

## Tools Configured

### Backend (Python)
- **Black** - Code formatting (line length: 100)
- **Ruff** - Fast linting (replaces flake8, isort, and more)
- **MyPy** - Static type checking
- **pytest** - Testing framework with coverage
- **pre-commit** - Git hook management

### Frontend (TypeScript/Vue)
- **ESLint** - Linting with Vue 3 and TypeScript support
- **Prettier** - Code formatting
- **vue-tsc** - TypeScript checking for Vue files
- **Vitest** - Unit testing framework

## Quick Start

### Setup Development Environment
```bash
# Install all dependencies and setup pre-commit hooks
make setup-dev

# Or manually:
cd backend && uv sync --dev
cd frontend && npm ci
pre-commit install
```

### Development Commands
```bash
# Start both servers
make dev

# Run all tests
make test

# Run linting
make lint

# Format all code
make format
```

## Pre-commit Hooks

Pre-commit hooks automatically run on every commit and include:

### Global Checks
- Trailing whitespace removal
- End-of-file fixing
- YAML/JSON validation
- Large file detection
- Private key detection

### Python (Backend)
- **Black** formatting
- **Ruff** linting and import sorting
- **MyPy** type checking

### TypeScript/Vue (Frontend)
- **ESLint** linting
- **Prettier** formatting

### Manual Hook Execution
```bash
# Run on all files
pre-commit run --all-files

# Run specific hook
pre-commit run black
pre-commit run eslint
```

## GitHub Actions Workflows

### Test Workflow (`.github/workflows/test.yml`)
**Triggers**: All branches except `master`, PRs to `master`

**Backend Tests**:
- Python 3.9 setup with Poetry
- Black formatting check
- Ruff linting
- MyPy type checking
- pytest with coverage

**Frontend Tests**:
- Node.js 18 setup
- ESLint linting
- TypeScript type checking
- Vitest unit tests
- Production build verification

### Build & Deploy Workflow (`.github/workflows/build_and_deploy.yml`)
**Triggers**: Pushes to `master` branch

**Features**:
- Parallel testing of both components
- Docker image building
- AWS ECR deployment (if configured)
- Elastic Beanstalk deployment (if configured)
- Fallback notifications if AWS not configured

## Configuration Files

### Root Level
- `.pre-commit-config.yaml` - Pre-commit hook configuration
- `Makefile` - Development commands
- `.vscode/` - VSCode workspace settings

### Backend
- `pyproject.toml` - Dependencies and tool configuration
  - Black settings
  - Ruff linting rules
  - MyPy configuration
  - pytest configuration
  - Coverage settings

### Frontend
- `package.json` - Dependencies and scripts
- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `tsconfig.json` - TypeScript configuration

## Code Style Guidelines

### Python
- **Line Length**: 100 characters
- **Formatting**: Black (automatic)
- **Import Sorting**: Ruff (automatic)
- **Type Hints**: Required for all functions
- **Docstrings**: Required for public functions

### TypeScript/Vue
- **Line Length**: 100 characters
- **Quotes**: Single quotes
- **Semicolons**: No trailing semicolons
- **Component Naming**: PascalCase
- **Composition API**: Preferred over Options API

## VSCode Integration

The `.vscode/` directory includes:

### Settings (`settings.json`)
- Python interpreter configuration
- ESLint and Prettier integration
- Format on save enabled
- Search exclusions for build artifacts

### Extensions (`extensions.json`)
Recommended extensions for optimal development:
- Python tools (Black, Ruff, MyPy)
- Vue tools (Volar, TypeScript Vue Plugin)
- General tools (Prettier, ESLint, GitLens)

### Tasks (`tasks.json`)
Pre-configured VSCode tasks:
- Install dependencies
- Run tests
- Format code
- Type checking

### Launch Configurations (`launch.json`)
Debug configurations:
- Backend server debugging
- Frontend development server
- Test execution
- Full-stack compound configuration

## CI/CD Environment Variables

### Required Secrets (for deployment)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### Optional Variables
- `AWS_REGION` - AWS region (default: us-east-1)
- `FRONTEND_ECR_REPOSITORY` - Frontend ECR repo name
- `BACKEND_ECR_REPOSITORY` - Backend ECR repo name
- `EB_APPLICATION_NAME` - Elastic Beanstalk app name
- `EB_ENVIRONMENT_NAME` - Elastic Beanstalk environment

## Common Commands

### Backend
```bash
cd backend

# Install dependencies
uv sync --dev

# Run tests
uv run pytest tests/ -v
uv run coverage run -m pytest tests/
uv run coverage report

# Code quality
uv run black .                    # Format
uv run ruff check .              # Lint
uv run ruff check --fix .        # Lint and fix
uv run mypy .                    # Type check

# Development server
uv run python app.py
```

### Frontend
```bash
cd frontend

# Install dependencies
npm ci

# Development
npm run dev                      # Dev server
npm run build                    # Production build
npm run preview                  # Preview build

# Testing
npm run test:unit                # Unit tests
npm run test                     # Watch mode

# Code quality
npm run lint                     # ESLint with auto-fix
npm run lint:check               # ESLint check only
npm run type-check               # TypeScript check
npm run format                   # Prettier format
npm run format:check             # Prettier check only
```

## Troubleshooting

### Pre-commit Hook Failures
```bash
# Skip hooks for emergency commits (not recommended)
git commit --no-verify

# Fix issues and re-commit
make format
git add .
git commit
```

### CI/CD Failures
1. Check the GitHub Actions tab for detailed logs
2. Run the same commands locally to reproduce issues
3. Ensure all tests pass locally before pushing

### Tool Version Issues
```bash
# Update pre-commit hooks
pre-commit autoupdate

# Update dependencies
cd backend && uv lock --upgrade
cd frontend && npm update
```

## Benefits

This setup provides:

✅ **Consistent Code Style** - Automatic formatting prevents style debates
✅ **Early Bug Detection** - Linting and type checking catch issues before runtime
✅ **Automated Quality Gates** - CI/CD prevents broken code from reaching production
✅ **Developer Productivity** - VSCode integration and Makefile commands streamline workflows
✅ **Team Collaboration** - Shared configurations ensure everyone uses the same tools
✅ **Professional Standards** - Industry-standard tools and practices
