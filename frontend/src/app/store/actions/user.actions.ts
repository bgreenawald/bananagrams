import { Injectable } from '@angular/core';
import { Action, createAction, props } from '@ngrx/store';
import { Tile, UserData } from './../../models';

// QUESTION - should you access your state in the reducers or pass them in through the parameters?


// load pizzas
export const CALL_BANANAGRAMS = '[Menu Gameplay] User called Bananagrams';
export const UPDATE_PLAYER_ID = '[Lobby] User submitted player id';
export const RESET_GAME = '[Game] User reset game'

export class CallBananagrams implements Action {
    readonly type = CALL_BANANAGRAMS;
    constructor(public gameID: string, public playerID: string, public words: string[]) { }
}

export class UpdatePlayerID implements Action {
    readonly type = UPDATE_PLAYER_ID;
    constructor(public playerID: string) { }
}

export class ResetGame implements Action {
    readonly type = RESET_GAME;
    constructor(public gameID: string) { }
}

export type UserActions = CallBananagrams | UpdatePlayerID | ResetGame;