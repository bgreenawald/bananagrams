import { createAction, props } from '@ngrx/store';
import { Tile, GameState } from '../../interfaces';

// Legacy action type constants (keeping for compatibility)
export const UPDATE_STORE = '[Game] Update Store';
export const UPDATE_USER_DATA = '[Game] Update User Data';

// Loading actions
export const loading = createAction(
  '[Landing] Load Game Data',
  props<{ payload?: any }>()
);

export const loadUser = createAction(
  '[Landing] Load User Data'
);

export const loadGameSuccess = createAction(
  '[Lobby] Load Game Data Success'
);

export const loadGameFail = createAction(
  '[Landing] Error received from socket server',
  props<{ errorMessage: string }>()
);

// Socket actions
export const openSocket = createAction(
  '[Any] Connect to Socket Server',
  props<{ gameID: string }>()
);

export const updateSocketData = createAction(
  '[Any] Received Data from Socket Server',
  props<{ message: string; payload: any }>()
);

export const failOpenSocket = createAction(
  '[App] Could not connect to socket',
  props<{ error: string; response: any }>()
);

export const socketReady = createAction(
  '[App] Now receiving socket messages'
);

// Player actions
export const setPlayerId = createAction(
  '[Lobby] Set Player ID',
  props<{ gameID: string; playerName: string }>()
);

export const setGameId = createAction(
  '[App] Set Game ID',
  props<{ gameID: string }>()
);

// Room actions
export const joinRoom = createAction(
  '[Lobby] Join room by Game ID',
  props<{ gameID: string }>()
);

export const successJoinRoom = createAction(
  '[Lobby] Room successfully joined'
);

// Game management actions
export const loadReservedGameIds = createAction(
  '[Landing] Get all game IDs in use by server'
);

export const setReservedGameIds = createAction(
  '[Effects via Landing] Response received: data of reserved game IDs',
  props<{ gameIDs: string[] }>()
);

export const loadOrCreateGame = createAction(
  '[Lobby] Load or Create New Game from socket server',
  props<{ gameID: string }>()
);

export const startGame = createAction(
  '[Lobby] Started the game',
  props<{ gameID: string }>()
);

// Game play actions
export const addPeeledTile = createAction(
  '[Game] Add peeled tile to bench'
);


// Legacy class-based actions for backward compatibility
export const updateStore = createAction(
  UPDATE_STORE,
  props<{ payload: any }>()
);

export const updateUserData = createAction(
  UPDATE_USER_DATA,
  props<{ payload: any }>()
);