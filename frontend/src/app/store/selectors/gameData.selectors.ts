
// game state
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import * as Models from './../../models';

export const getGameStateSelector = createFeatureSelector<any>('game');

export const getGameDataSelector = createSelector(
    getGameStateSelector,
    (state: Models.GameState) => state ? state.GameData : null
);

export const getGameIDSelector = createSelector(
    getGameDataSelector,
    (state: Models.GameData) => state ? state.id : null
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
    (state: Models.GameState) => state ? state.playerID : null
)