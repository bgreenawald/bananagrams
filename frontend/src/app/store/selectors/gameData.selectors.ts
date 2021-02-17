
// game state
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import * as Models from './../../models';

import * as fromRouterStore from './../../../app/router-store';

export const getGameStateSelector = createFeatureSelector<any>('game');

export const getGameDataSelector = createSelector(
    getGameStateSelector,
    (state: Models.GameState) => state.gameData
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

export const getGameID = createSelector(
    getGameStateSelector,
    fromRouterStore.getRouterState,
    (entities, router) => {
        return router.state && entities[router.state.params.id]
    }
)