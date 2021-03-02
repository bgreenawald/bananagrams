import { Injectable } from '@angular/core';
import { Action, createAction, props } from '@ngrx/store';
import { Tile, UserData } from './../../models';

export const UPDATE_STORE = 'Add'
export const UPDATE_USER_DATA = 'Update User Data'

export class UpdateStore implements Action {
    readonly type = UPDATE_STORE
    constructor(public payload: any) { }
};

export class UpdateUserData implements Action {
    readonly type = UPDATE_USER_DATA
    constructor(public payload: UserData) { }
};

// load pizzas
export const LOADING = '[Landing] Load Game Data';
export const LOAD_USER = '[Landing] Load User Data';
export const LOAD_GAME_SUCCESS = '[Lobby] Load Game Data Success';
export const LOAD_GAME_FAIL = '[Landing] Error received from socket server';
export const OPEN_SOCKET = '[Any] Connect to Socket Server';
export const UPDATE_SOCKET_DATA = '[Any] Received Data from Socket Server';
export const SET_PLAYER_ID = '[Lobby] Set Player ID';
export const SET_GAME_ID = '[App] Set Game ID';
export const JOIN_ROOM = '[Lobby] Join room by Game ID';
export const LOAD_RESERVED_GAME_IDS = '[Landing] Get all game IDs in use by server';
export const SET_RESERVED_GAME_IDS = '[Effects via Landing] Response received: data of reserved game IDs'
export const LOAD_OR_CREATE_GAME = '[Lobby] Load or Create New Game from socket server';
export const SUCCESS_JOIN_ROOM = '[Lobby] Room successfully joined';
export const FAIL_OPEN_SOCKET = '[App] Could not connect to socket';
export const SOCKET_READY = '[App] Now receiving socket messages';
export const START_GAME = '[Lobby] Started the game';

export class Loading implements Action {
    readonly type = LOADING;
    constructor(public payload: any) { }
}
export class LoadUser implements Action { // remove?
    readonly type = LOAD_USER;
}
export class LoadGameFail implements Action {
    readonly type = LOAD_GAME_FAIL;
    constructor(public errorMessage: string) { }
}
export class LoadGameSuccess implements Action {
    readonly type = LOAD_GAME_SUCCESS;
}

export class OpenSocket implements Action {
    readonly type = OPEN_SOCKET;
    constructor(public gameID: string) { };
}

export class UpdateSocketData implements Action {
    readonly type = UPDATE_SOCKET_DATA;
    constructor(public message: string, public payload: any) { }
}

export class SetPlayerId implements Action {
    readonly type = SET_PLAYER_ID;
    constructor(public gameID: string, public playerName: string) { }
}

export class SetGameID implements Action { // remove?
    readonly type = SET_GAME_ID;
    constructor(public gameID: string) { }
}

export class JoinRoom implements Action { // remove?
    readonly type = JOIN_ROOM;
    constructor(public gameID: string) { }
}

export class LoadReservedGameIDs implements Action {
    readonly type = LOAD_RESERVED_GAME_IDS;
}

export class SetReservedGameIDs implements Action {
    readonly type = SET_RESERVED_GAME_IDS;
    constructor(public gameIDs: string[]) { }
}

export class LoadOrCreateGame implements Action {
    readonly type = LOAD_OR_CREATE_GAME;
    constructor(public gameID: string) { };
}

export class SuccessJoinRoom implements Action {
    readonly type = SUCCESS_JOIN_ROOM;
}

export class FailOpenSocket implements Action {
    readonly type = FAIL_OPEN_SOCKET;
    constructor(public error: string, public response: any) { };
}

export class SocketReady implements Action {
    readonly type = SOCKET_READY;
}

export class StartGame implements Action {
    readonly type = START_GAME;
    constructor(public gameID: string) { };
}

export type GameActionTypes = UpdateStore | UpdateUserData | Loading | LoadUser | LoadGameFail | LoadGameSuccess | OpenSocket | UpdateSocketData | SetPlayerId | SetGameID | LoadReservedGameIDs | SetReservedGameIDs | LoadOrCreateGame | JoinRoom | SuccessJoinRoom | FailOpenSocket | SocketReady | StartGame;