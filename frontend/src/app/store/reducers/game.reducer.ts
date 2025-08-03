import { createReducer, on } from '@ngrx/store';
import * as GameActions from '../actions/game.actions';
import { GameState } from '../../interfaces';

// Extended game state interface for store
export interface StoreGameState {
  selectedTiles: any[];
  playerID: string;
  loaded: boolean;
  loading: boolean;
  gameData: any;
  id?: string;
  unavailableIDs?: string[];
  error?: string;
}

const initialState: StoreGameState = {
  selectedTiles: [],
  playerID: '',
  loaded: false,
  loading: false,
  gameData: {}
};

export const gameReducer = createReducer(
  initialState,
  
  // Legacy update store action
  on(GameActions.updateStore, (state, { payload }) => ({
    ...state,
    ...payload
  })),

  // Loading states
  on(GameActions.loading, (state, { payload }) => ({
    ...state,
    loading: true,
    loaded: false,
    ...payload
  })),

  on(GameActions.loadGameSuccess, (state) => ({
    ...state,
    loading: false,
    loaded: true
  })),

  on(GameActions.loadGameFail, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: errorMessage
  })),

  // Socket data updates
  on(GameActions.updateSocketData, (state, { payload }) => ({
    ...state,
    gameData: payload
  })),

  // Player and game ID management
  on(GameActions.setPlayerId, (state, { playerName }) => ({
    ...state,
    playerID: playerName
  })),

  on(GameActions.setGameId, (state, { gameID }) => ({
    ...state,
    id: gameID
  })),

  // Reserved game IDs
  on(GameActions.setReservedGameIds, (state, { gameIDs }) => ({
    ...state,
    unavailableIDs: gameIDs
  })),

  // Socket connection states
  on(GameActions.failOpenSocket, (state, { error }) => ({
    ...state,
    error
  })),

  on(GameActions.socketReady, (state) => ({
    ...state,
    // Socket is ready - could add connection status here
  }))
);