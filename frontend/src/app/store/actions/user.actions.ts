import { Injectable } from '@angular/core';
import { Action, createAction, props } from '@ngrx/store';
import { Tile, UserData } from './../../models';

// QUESTION - should you access your state in the reducers or pass them in through the parameters?


// load pizzas
export const CALL_BANANAGRAMS = '[Menu Gameplay] User called Bananagrams';
export const UPDATE_PLAYER_ID = '[Lobby] User submitted player id';
export const RESET_GAME = '[Game] User reset game';
export const SWAP_TILES = '[Tile] Swap tiles';
export const UPDATE_PEELED_TILES = '[App Socket Response] Update tiles received from successful peel response'

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

export class SwapTiles implements Action {
    readonly type = SWAP_TILES;
    constructor(public letter: string) { }
}

export class UpdatePeeledTiles implements Action {
    readonly type = UPDATE_PEELED_TILES;
    constructor(public tiles: any) { }
}

export type UserActions = CallBananagrams | UpdatePlayerID | ResetGame | SwapTiles | UpdatePeeledTiles;
// QUESTION: what is the diff between the action (string) and the export class and this?
