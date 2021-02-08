import { Injectable } from '@angular/core';
import { Action, createAction, props } from '@ngrx/store';
import { Tile, UserData } from './../../models/models';

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
export const LOADING = '[Landing Component] Load Game Data';
export const LOAD_USER = '[Landing Component] Load User Data';
export const LOAD_GAME_SUCCESS = '[Landing Component] Load Game Data Success';
export const LOAD_GAME_FAIL = '[Landing Component] Load Game Data Fail';
export const OPEN_SOCKET = '[Any Component] Connect to Socket Server';
export const UPDATE_SOCKET_DATA = '[Any Component] Received Data from Socket Server';

export class Loading implements Action {
    readonly type = LOADING;
    constructor(public payload: any) { }
}
export class LoadUser implements Action {
    readonly type = LOAD_USER;
}
export class LoadGameFail implements Action {
    readonly type = LOAD_GAME_FAIL;
    constructor(public payload: any) { }
}
export class LoadGameSuccess implements Action {
    readonly type = LOAD_GAME_SUCCESS;
    constructor(public payload: any) { }
}

export class OpenSocket implements Action {
    readonly type = OPEN_SOCKET;
}

export class UpdateSocketData implements Action {
    readonly type = UPDATE_SOCKET_DATA;
    constructor(public message: string, public payload: any) { }
}

export type GameActions = UpdateStore | UpdateUserData | Loading | LoadUser | LoadGameFail | LoadGameSuccess | OpenSocket | UpdateSocketData;