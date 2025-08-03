# Bananagrams Vue Frontend

A Vue.js reimplementation of the Bananagrams multiplayer word game frontend, migrated from Angular.

## Features

- **Modern Vue 3 Architecture**: Built with Composition API, TypeScript, and Vite
- **Real-time Multiplayer**: WebSocket integration for live gameplay
- **Drag & Drop Interface**: Intuitive tile placement with multi-tile selection
- **Game Logic**: Complete board validation, word extraction, and connectivity checks
- **Responsive Design**: Clean, modern UI that works across devices
- **State Management**: Centralized state with Pinia stores

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python backend running on port 5000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands

```bash
npm run dev       # Start dev server (http://localhost:8080)
npm run build     # Build for production
npm run preview   # Preview production build
npm run test      # Run unit tests
npm run lint      # Lint code
```

## Project Structure

```
src/
├── components/          # Vue components
│   ├── common/         # Shared components (Modal)
│   └── game/           # Game-specific components
├── views/              # Route-level views
├── stores/             # Pinia stores
├── composables/        # Composition API hooks
├── types/              # TypeScript type definitions
├── styles/             # Global styles
└── router/             # Vue Router configuration
```

## Architecture Improvements Over Angular Version

- **Simplified State Management**: Replaced NgRx with Pinia for cleaner, more intuitive state handling
- **Better Performance**: Vue 3's Proxy-based reactivity and Composition API
- **Cleaner Drag & Drop**: Custom composables replace complex Angular services
- **Modern Tooling**: Vite for faster builds and HMR
- **Smaller Bundle**: More efficient tree-shaking and build optimization

## Game Components

### Views
- **LandingView**: Game creation/joining interface
- **LobbyView**: Player waiting room with name registration
- **GameView**: Main game container
- **GameOverView**: End game results display

### Game Components
- **GameBoard**: 40x40 grid of interactive cells
- **BoardCell**: Individual grid positions with drop handling
- **GameTile**: Draggable letter tiles with selection states
- **GameBench**: Player's available tiles container
- **GameControls**: Game actions (Peel, Bananagrams, Reset)

### Common Components
- **GameModal**: Reusable modal for confirmations and word review

## State Stores

- **gameStore**: Game state, players, tiles remaining
- **playerStore**: Current player data, tiles, selections
- **boardStore**: Board grid state and tile positions
- **socketStore**: WebSocket connection and event handling
- **uiStore**: Modal state, drag state, UI interactions

## Key Features

### Drag & Drop System
- Multi-tile selection with click
- Drag any selected tile to move all
- Collision detection and validation
- Board ↔ bench tile movement
- Visual feedback during operations

### Game Logic
- Board connectivity validation
- Word extraction (horizontal/vertical)
- Empty bench verification
- Tile swapping mechanism

### Real-time Communication
- Socket.io integration with Python backend
- Game state synchronization
- Player action broadcasting
- Error handling and reconnection

## Backend Integration

The frontend expects a Python Flask backend running on `localhost:5000` with Socket.IO support. The backend should handle:

- Game creation and joining
- Tile distribution and validation
- Word dictionary checking
- Game state management
- Player synchronization

## Development Notes

- Uses TypeScript for type safety
- SCSS for styling with component scoping
- Vite proxy configuration for backend API calls
- Hot module replacement for fast development
- Production-ready build optimization

## Deployment

The built application (in `dist/`) can be deployed to any static hosting service. Configure your web server to:

1. Serve the built files
2. Proxy `/socket.io` requests to your backend
3. Handle client-side routing with history API fallback