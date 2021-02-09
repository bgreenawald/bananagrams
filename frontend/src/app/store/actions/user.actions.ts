import { Injectable } from '@angular/core';
import { Action, createAction, props } from '@ngrx/store';
import { Tile, UserData } from './../../models';


// load pizzas
export const CALL_BANANAGRAMS = '[Menu Gameplay Component] User called Bananagrams';
export const UPDATE_PLAYER_ID = '[Lobby Component] User submitted player id';

export class CallBananagrams implements Action {
    readonly type = CALL_BANANAGRAMS;
    constructor(public gameID: string, public playerID: string, public words: string[]) { }
}

export class UpdatePlayerID implements Action {
    readonly type = UPDATE_PLAYER_ID;
    constructor(public playerID: string) { }
}

export type UserActions = CallBananagrams | UpdatePlayerID;