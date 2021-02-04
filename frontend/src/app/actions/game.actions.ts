import { Injectable } from '@angular/core';
import { Action, createAction, props } from '@ngrx/store';
import { Tile, UserData } from './../models/models';

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

export type Actions = UpdateStore | UpdateUserData;

// export const updateStore = createAction('Update', props<{ payload: any }>());
// export const updateUserData = createAction('UpdateUserData', props<{ payload: any }>());