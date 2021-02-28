
// game state
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCoreRouter from '@ngrx/router-store';
import * as Models from './../../models';

import * as routerSelectors from './router.selectors';

export const getGameStateSelector = createFeatureSelector<any>('game');

export const getGameDataSelector = createSelector(
    getGameStateSelector,
    (state: Models.GameState) => state.gameData
);

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

export const getReservedGameIDs = createSelector(
    getGameStateSelector,
    (state: Models.GameState) => state.unavailableIDs
)