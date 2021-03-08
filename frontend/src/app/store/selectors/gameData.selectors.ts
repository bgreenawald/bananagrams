
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
    (state: Models.GameState) => {
        return state.playerID ? state.playerID : localStorage.getItem('player_id')
    }
)

export const getReservedGameIDs = createSelector(
    getGameStateSelector,
    (state: Models.GameState) => state.unavailableIDs
)

export const getAllPlayers = createSelector(
    getGameDataSelector,
    (data: Models.GameData) => data.players ? Object.keys(data.players) : []
)

export const getPlayerTiles = createSelector(
    getGameDataSelector,
    getPlayerIDSelector,
    (data: Models.GameData, playerID: string) => {
        console.log('data', data, 'playerID', playerID)
        if (Object.keys(data).length === 0) return;

        const playersToTiles: any = data.players;
        const allPlayerIDs = Object.keys(playersToTiles);

        for (let i = 0; i < allPlayerIDs.length; i++) {
            const player = allPlayerIDs[i];
            if (player === playerID) return playersToTiles[playerID]
        }
    }
)