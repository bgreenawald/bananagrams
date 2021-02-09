
// game state
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import * as Models from './../../models';

export const getGameStateSelector = createFeatureSelector<Models.GameState>('game');

export const getGameDataSelector = createSelector(
    getGameStateSelector,
    (state: Models.GameState) => state.GameData
);

export const getGameIDSelector = createSelector(
    getGameDataSelector,
    (state: Models.GameData) => state.id
)

export const selectLoadedStatus = createSelector(
    getGameStateSelector,
    (state: Models.GameState) => state.loaded
)

export const selectLoadingStatus = createSelector(
    getGameStateSelector,
    (state: Models.GameState) => state.loading
)

export const getPlayerIDSelector = createSelector(
    getGameStateSelector,
    (state: Models.GameState) => state.playerID
)