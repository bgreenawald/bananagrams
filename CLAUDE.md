# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an online multiplayer Bananagrams game with a Python Flask backend and Angular frontend. The application uses WebSocket connections for real-time gameplay and includes a complete game state management system.

## Architecture

### Backend (Python/Flask)
- **Main files**: `backend/app.py` (Flask app with SocketIO) and `backend/game.py` (core game logic)
- **Framework**: Flask with Flask-SocketIO for WebSocket communication
- **Game Logic**: Handles tile distribution, word validation, game state transitions (IDLE → ACTIVE → ENDGAME → OVER)
- **Word Validation**: Uses `words/words.txt` dictionary for validating player word grids
- **Tile System**: Implements proper Bananagrams tile frequency distribution

### Frontend (Angular)
- **Framework**: Angular 9 with Angular Material UI components
- **State Management**: NgRx store pattern with actions, reducers, effects, and selectors
- **Real-time Communication**: ngx-socket-io for WebSocket connections to backend
- **Key Components**: 
  - Game board with drag-and-drop tile placement
  - Player bench for tile management  
  - Lobby system for multiplayer matchmaking
  - Modal system for game notifications

### State Architecture
- **Frontend State**: Managed via NgRx store in `frontend/src/app/store/`
- **Backend State**: Game instances stored in memory dictionary `all_games`
- **Communication**: Bidirectional WebSocket events between frontend and backend
- **Routing**: Dynamic routing based on game state (lobby → game → gameover)

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

# Node setup (requires Node 12.0.0)
nvm use 12.0.0  # or nvm install 12.0.0 first time
npm install

# Development
npm run start     # dev server with hot reload
npm run build     # production build
npm run test      # run unit tests
npm run lint      # run linting
npm run e2e       # run end-to-end tests
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
- **Frontend**: `package.json` (npm deps), `angular.json` (build config), `tsconfig.json` (TypeScript config)
- **Code Quality**: Black max-line-length=100, flake8 with custom rules, mypy type checking enabled

## Testing Strategy

- **Backend**: pytest with xdist for parallel execution, coverage reporting required
- **Frontend**: Jasmine/Karma for unit tests, Protractor for e2e tests
- **Code Style**: Enforced via black (backend) and tslint (frontend)

## WebSocket Event Flow

The game uses a custom WebSocket protocol where:
1. Frontend emits game actions (join, place tiles, peel, etc.)
2. Backend validates actions and updates game state
3. Backend broadcasts state changes to all players in room
4. Frontend receives updates and dispatches NgRx actions to update UI

## Important Notes

- Game state transitions follow strict rules: IDLE → ACTIVE → ENDGAME → OVER
- Tile validation occurs on both frontend (UX) and backend (authority)
- Player sessions maintained via localStorage and server-side game instances
- Word dictionary validation is case-insensitive and uses the included words.txt file