# Bananagrams Online Multiplayer Game

A real-time multiplayer implementation of the Bananagrams word game, built with Vue.js frontend and Python Flask backend.

## 🎮 Game Features

- **Real-time multiplayer gameplay** via WebSocket connections
- **Dynamic tile management** with drag-and-drop board interface
- **Word validation** against comprehensive dictionary
- **Game state transitions** (IDLE → ACTIVE → ENDGAME → OVER)
- **Test mode** for single-player development and testing

## 🏗️ Architecture

### Frontend (Vue.js)
- **Framework**: Vue 3 with Composition API and TypeScript
- **State Management**: Pinia stores with composables pattern
- **Build Tool**: Vite for fast development and building
- **Real-time Communication**: Socket.io-client for WebSocket connections
- **Styling**: SCSS with component-scoped styles

### Backend (Python/Flask)
- **Framework**: Flask with Flask-SocketIO for WebSocket communication
- **Game Logic**: Complete Bananagrams rule implementation
- **Word Validation**: Dictionary-based word checking
- **Concurrency**: Thread-safe game state management

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- UV (Python package manager) or Poetry
- npm

### Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd bananagrams

# Install all dependencies and setup pre-commit hooks
make setup-dev

# Start both servers
make dev
```

The game will be available at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000

### Manual Setup

#### Backend Setup
```bash
cd backend

# Using UV (recommended)
uv sync --dev
uv run python app.py

# Using Poetry (alternative)
poetry install
poetry run python app.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing & Code Quality

### Run All Tests
```bash
make test
```

### Code Quality Checks
```bash
# Run linting
make lint

# Format code
make format

# Run pre-commit hooks on all files
pre-commit run --all-files
```

### Individual Commands

#### Backend
```bash
cd backend

# Tests
uv run pytest tests/ -v
uv run coverage run -m pytest tests/
uv run coverage report

# Code quality
uv run black .                    # Format code
uv run ruff check .              # Lint code
uv run mypy .                    # Type checking
```

#### Frontend
```bash
cd frontend

# Tests
npm run test:unit                # Unit tests
npm run test                     # Watch mode

# Code quality
npm run lint                     # ESLint with auto-fix
npm run lint:check               # ESLint check only
npm run type-check               # TypeScript checking
npm run format                   # Prettier formatting
npm run format:check             # Prettier check only

# Build
npm run build                    # Production build
```

## 🛠️ Development Workflow

### Pre-commit Hooks
Pre-commit hooks are automatically installed with `make setup-dev`. They run:
- Code formatting (Black for Python, Prettier for TypeScript/Vue)
- Linting (Ruff for Python, ESLint for TypeScript/Vue)
- Type checking (MyPy for Python, vue-tsc for Vue)
- General checks (trailing whitespace, large files, etc.)

### Code Style
- **Python**: Black formatting, Ruff linting, strict MyPy type checking
- **TypeScript/Vue**: ESLint + Prettier, strict TypeScript configuration
- **Line Length**: 100 characters for both Python and TypeScript
- **Import Sorting**: Automatic via Ruff (Python) and ESLint (TypeScript)

### Git Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit (pre-commit hooks will run automatically)
3. Push and create pull request
4. CI will run tests and code quality checks
5. Merge after approval and passing checks

## 🐳 Docker Development

```bash
# Build and start containers
make docker-build
make docker-up

# Stop containers
make docker-down
```

## 🏗️ CI/CD

### GitHub Actions Workflows

#### Test Workflow (`.github/workflows/test.yml`)
- Runs on all branches except `master`
- Tests both frontend and backend in parallel
- Includes linting, type checking, and unit tests

#### Build & Deploy Workflow (`.github/workflows/build_and_deploy.yml`)
- Runs on `master` branch pushes
- Builds Docker images
- Deploys to AWS (if configured)

### Environment Variables & Secrets

#### Required Secrets (for deployment)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

#### Optional Variables
- `AWS_REGION` (default: us-east-1)
- `FRONTEND_ECR_REPOSITORY` (default: bananagrams-frontend)
- `BACKEND_ECR_REPOSITORY` (default: bananagrams-backend)
- `EB_APPLICATION_NAME` (for Elastic Beanstalk)
- `EB_ENVIRONMENT_NAME` (for Elastic Beanstalk)

## 📁 Project Structure

```
bananagrams/
├── .github/workflows/          # CI/CD workflows
├── .pre-commit-config.yaml     # Pre-commit hook configuration
├── Makefile                    # Development commands
├── README.md
├── backend/                    # Python Flask backend
│   ├── app.py                 # Main Flask application
│   ├── game.py                # Game logic implementation
│   ├── tests/                 # Backend tests
│   ├── words/                 # Word dictionary
│   └── pyproject.toml         # Python dependencies & config
└── frontend/                   # Vue.js frontend
    ├── src/
    │   ├── components/        # Vue components
    │   ├── composables/       # Vue composables
    │   ├── stores/           # Pinia stores
    │   ├── types/            # TypeScript type definitions
    │   ├── utils/            # Utility functions
    │   └── views/            # Route views
    ├── package.json          # Node.js dependencies
    ├── .eslintrc.cjs        # ESLint configuration
    ├── .prettierrc          # Prettier configuration
    └── tsconfig.json        # TypeScript configuration
```

## 🎯 Game Rules

Bananagrams is a fast-paced word game where players race to use all their letter tiles to build interconnected words in a crossword-style grid.

### Basic Flow
1. **Join Game**: Players join a game lobby
2. **Start Game**: Tiles are distributed to all players
3. **Build Words**: Create interconnected words on your board
4. **Peel**: When you use all tiles, call "Peel!" to give everyone a new tile
5. **Endgame**: When few tiles remain, no more peeling allowed
6. **Bananagrams**: First to use all tiles in valid words wins!

### Game States
- **IDLE**: Waiting for players to join
- **ACTIVE**: Main gameplay, peeling allowed
- **ENDGAME**: Final phase, no peeling
- **OVER**: Game finished

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the code style guidelines
4. Add tests for new functionality
5. Ensure all tests and code quality checks pass
6. Submit a pull request

## 📄 License

[Add your license information here]# Test
