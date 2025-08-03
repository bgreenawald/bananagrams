import { createReducer, on } from '@ngrx/store';
import * as UserActions from '../actions/user.actions';
import { Tile } from '../../interfaces';

// User state interface
export interface UserState {
  playerID: string | null;
  tiles: Tile[];
  currentView: string;
}

const initialState: UserState = {
  playerID: null,
  tiles: [],
  currentView: 'Loading State'
};

export const userReducer = createReducer(
  initialState,
  
  // Player ID management
  on(UserActions.updatePlayerId, (state, { playerID }) => ({
    ...state,
    playerID
  })),

  // Game actions that don't modify state directly
  // These actions trigger effects that communicate with the socket
  on(UserActions.callBananagrams, (state) => state),
  
  on(UserActions.resetGame, (state) => state),
  
  on(UserActions.swapTiles, (state) => state),
  
  // Update tiles from socket response
  on(UserActions.updatePeeledTiles, (state, { tiles }) => ({
    ...state,
    tiles: [...state.tiles, ...tiles]
  }))
);