import * as GameReducers from './game.reducer';
import * as Models from './../../models/models';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

// TODO
// export interface GameState {
//     userData: GameReducers.GameState;
//     gameData: any;
// }

export const reducers: ActionReducerMap<any> = {
    gameReducer: GameReducers.gameReducer
}

export const getGameState = createFeatureSelector<Models.GameState>('game');
// game state

export const getGameStateSelector = createSelector(
    getGameState,
    (state: Models.GameState) => state.GameData
);

export const selectLoadedStatus = createSelector(
    getGameState,
    (state: Models.GameState) => state.loaded
)

export const selectLoadingStatus = createSelector(
    getGameState,
    (state: Models.GameState) => state.loading
)