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

export type GameActions = UpdateStore | UpdateUserData | Loading | LoadUser | LoadGameFail | LoadGameSuccess;

// export const updateStore = createAction('Update', props<{ payload: any }>());
// export const updateUserData = createAction('UpdateUserData', props<{ payload: any }>());



// load pizzas
export const LOADING = '[Landing Component] Load Game Data';
export const LOAD_USER = '[Landing Component] Load User Data';
export const LOAD_GAME_SUCCESS = '[Landing Component] Load Game Data Success';
export const LOAD_GAME_FAIL = '[Landing Component] Load Game Data Fail';

export class Loading implements Action {
    readonly type = LOADING;
    constructor(public payload: any) { }
}
export class LoadUser implements Action {
    readonly type = LOAD_USER;
    constructor(public payload: any) { }
}
export class LoadGameFail implements Action {
    readonly type = LOAD_GAME_FAIL;
    constructor(public payload: any) { }
}
export class LoadGameSuccess implements Action {
    readonly type = LOAD_GAME_SUCCESS;
    constructor(public payload: any) { }
}