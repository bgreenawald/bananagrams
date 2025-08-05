# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an online multiplayer Bananagrams game with a Python Flask backend and Vue.js frontend. The application uses WebSocket connections for real-time gameplay and includes a complete game state management system.

## Architecture

### Backend (Python/Flask)
- **Main files**: `backend/app.py` (Flask app with SocketIO) and `backend/game.py` (core game logic)
- **Framework**: Flask with Flask-SocketIO for WebSocket communication
- **Game Logic**: Handles tile distribution, word validation, game state transitions (IDLE → ACTIVE → ENDGAME → OVER)
- **Word Validation**: Uses `words/words.txt` dictionary for validating player word grids
- **Tile System**: Implements proper Bananagrams tile frequency distribution

### Frontend (Vue.js)
- **Framework**: Vue 3 with Composition API and TypeScript
- **Build Tool**: Vite for fast development and building
- **State Management**: Pinia stores with composables pattern
- **Real-time Communication**: Socket.io-client for WebSocket connections to backend
- **Key Components**:
  - Game board with drag-and-drop tile placement using Vue composables
  - Player bench for tile management
  - Lobby system for multiplayer matchmaking
  - Modal system for game notifications
- **Styling**: SCSS with component-scoped styles

### State Architecture
- **Frontend State**: Managed via Pinia stores in `frontend/src/stores/` (game, player, board, socket, ui)
- **Backend State**: Game instances stored in memory dictionary `all_games`
- **Communication**: Bidirectional WebSocket events between frontend and backend
- **Routing**: Vue Router with dynamic routing based on game state (lobby → game → gameover)

## Development Commands

### Backend Setup and Development
```bash
cd backend

# Using Poetry (preferred)
poetry install --no-dev  # production dependencies
poetry install           # all dependencies including dev tools
python app.py            # run development server

# Using pip/virtualenv
pip install -r requirements.txt      # production
pip install -r requirements-dev.txt  # development
```

### Backend Testing and Quality
```bash
cd backend

# Run tests
pytest tests/
pytest -n 4 -v --disable-warnings tests  # parallel execution, verbose

# Code coverage
coverage run -m pytest tests/
coverage report

# Code quality tools
black .                    # code formatting
flake8                     # linting
mypy .                     # type checking
pylint app.py game.py      # additional linting
```

### Frontend Setup and Development
```bash
cd frontend

# Node setup (requires Node 18+)
npm install

# Development
npm run dev       # Vite dev server with hot reload
npm run build     # production build with TypeScript checking
npm run preview   # preview production build
npm run test      # run unit tests with Vitest
npm run lint      # run ESLint with auto-fix
```

### Docker Development
```bash
# Run full stack
docker-compose up

# Frontend accessible at http://localhost:8080
# Backend runs internally and connects via container networking
```

## Key Configuration Files

- **Backend**: `pyproject.toml` (Poetry deps), `setup.cfg` (flake8, mypy, coverage config)
- **Frontend**: `package.json` (npm deps), `vite.config.ts` (Vite config), `tsconfig.json` (TypeScript config)
- **Code Quality**: Black max-line-length=100, flake8 with custom rules, mypy type checking enabled, ESLint for frontend

## Testing Strategy

- **Backend**: pytest with xdist for parallel execution, coverage reporting required
- **Frontend**: Vitest for unit tests with Vue Test Utils
- **Code Style**: Enforced via black (backend) and ESLint (frontend)

## WebSocket Event Flow

The game uses a custom WebSocket protocol where:
1. Frontend emits game actions (join, place tiles, peel, etc.)
2. Backend validates actions and updates game state
3. Backend broadcasts state changes to all players in room
4. Frontend receives updates and updates Pinia stores to trigger UI reactivity

## Important Notes

- Game state transitions follow strict rules: IDLE → ACTIVE → ENDGAME → OVER
- Tile validation occurs on both frontend (UX) and backend (authority)
- Player sessions maintained via localStorage and server-side game instances
- Word dictionary validation is case-insensitive and uses the included words.txt file
