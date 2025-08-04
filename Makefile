# Bananagrams Monorepo Makefile
.PHONY: help install install-backend install-frontend test test-backend test-frontend lint lint-backend lint-frontend format format-backend format-frontend clean build build-backend build-frontend dev dev-backend dev-frontend docker-build docker-up docker-down setup-hooks

# Default target
help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

# Setup and Installation
install: install-backend install-frontend setup-hooks ## Install all dependencies

install-backend: ## Install backend dependencies
	cd backend && uv sync --dev

install-frontend: ## Install frontend dependencies
	cd frontend && npm ci

setup-hooks: ## Setup pre-commit hooks
	pre-commit install
	@echo "Pre-commit hooks installed. Run 'pre-commit run --all-files' to check all files."

# Development
dev: ## Start both frontend and backend in development mode
	@echo "Starting backend and frontend development servers..."
	@echo "Backend will run on http://localhost:5000"
	@echo "Frontend will run on http://localhost:8080"
	@make -j2 dev-backend dev-frontend

dev-backend: ## Start backend development server
	cd backend && uv run python app.py

dev-frontend: ## Start frontend development server
	cd frontend && npm run dev

# Testing
test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	cd backend && uv run coverage run -m pytest tests/ -v && uv run coverage report

test-frontend: ## Run frontend tests
	cd frontend && npm run test:unit

# Code Quality
lint: lint-backend lint-frontend ## Run linting for both projects

lint-backend: ## Run backend linting
	cd backend && uv run ruff check .

lint-frontend: ## Run frontend linting
	cd frontend && npm run lint:check

format: format-backend format-frontend ## Format code for both projects

format-backend: ## Format backend code
	cd backend && uv run black . && uv run ruff check --fix .

format-frontend: ## Format frontend code
	cd frontend && npm run format

# Building
build: build-backend build-frontend ## Build both projects

build-backend: ## Build backend (prepare for production)
	cd backend && uv run python -m py_compile app.py game.py

build-frontend: ## Build frontend for production
	cd frontend && npm run build

# Docker
docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

# Cleanup
clean: ## Clean build artifacts and dependencies
	cd backend && rm -rf .venv __pycache__ *.pyc .coverage .pytest_cache .mypy_cache
	cd frontend && rm -rf node_modules dist .vite
	rm -rf .pre-commit-cache

# CI/CD helpers
ci-install: ## Install dependencies for CI (optimized)
	cd backend && uv sync --dev --no-cache
	cd frontend && npm ci --no-audit --no-fund

ci-test: ## Run tests in CI mode
	cd backend && uv run coverage run -m pytest tests/ -v --tb=short
	cd frontend && npm run test:unit -- --run

ci-lint: ## Run linting in CI mode (no fixes)
	cd backend && uv run black --check . && uv run ruff check . && uv run mypy .
	cd frontend && npm run lint:check && npm run format:check

# Database/Migration helpers (for future use)
migrate: ## Run database migrations (placeholder)
	@echo "No migrations configured yet"

# Documentation
docs: ## Generate documentation (placeholder)
	@echo "Documentation generation not configured yet"

# Utility targets
check-deps: ## Check for dependency updates
	cd backend && uv lock --upgrade-package
	cd frontend && npm outdated

security-check: ## Run security checks
	cd backend && uv run bandit -r . -f json || true
	cd frontend && npm audit

# Environment setup
setup-dev: install ## Complete development environment setup
	@echo "Development environment setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Run 'make dev' to start both servers"
	@echo "2. Open http://localhost:8080 in your browser"
	@echo "3. Backend API will be available at http://localhost:5000"
	@echo ""
	@echo "Useful commands:"
	@echo "- make test       # Run all tests"
	@echo "- make lint       # Check code quality"
	@echo "- make format     # Format code"
