import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StoreGameState } from '../reducers/game.reducer';
import { GameState } from '../../interfaces';

// Feature selector for game state
export const selectGameState = createFeatureSelector<StoreGameState>('game');

// Game data selectors
export const selectGameData = createSelector(
  selectGameState,
  (state: StoreGameState) => state.gameData
);

export const selectLoadedStatus = createSelector(
  selectGameState,
  (state: StoreGameState) => state.loaded
);

export const selectLoadingStatus = createSelector(
  selectGameState,
  (state: StoreGameState) => state.loading
);

export const selectPlayerID = createSelector(
  selectGameState,
  (state: StoreGameState) => {
    return state.playerID ? state.playerID : localStorage.getItem('player_id');
  }
);

export const selectReservedGameIDs = createSelector(
  selectGameState,
  (state: StoreGameState) => state.unavailableIDs
);

export const selectAllPlayers = createSelector(
  selectGameData,
  (data: any) => data?.players ? Object.keys(data.players) : []
);

export const selectWinningPlayer = createSelector(
  selectGameData,
  (socketData: any) => socketData?.winning_player
);

export const selectWinningWords = createSelector(
  selectGameData,
  (socketData: any) => socketData?.winning_words
);

export const selectRemainingTiles = createSelector(
  selectGameData,
  (socketData: any) => socketData?.tiles_remaining
);

export const selectPlayerTiles = createSelector(
  selectGameData,
  selectPlayerID,
  (data: any, playerID: string | null) => {
    if (!data || Object.keys(data).length === 0 || !playerID) { 
      return [];
    }

    const playersToTiles: any = data.players;
    const allPlayerIDs = Object.keys(playersToTiles);

    for (let i = 0; i < allPlayerIDs.length; i++) {
      const player = allPlayerIDs[i];
      if (player === playerID) { 
        return playersToTiles[playerID]; 
      }
    }
    
    return [];
  }
);

export const selectGameError = createSelector(
  selectGameState,
  (state: StoreGameState) => state.error
);

// Legacy selectors for backward compatibility
export const getGameStateSelector = selectGameState;
export const getGameDataSelector = selectGameData;
export const getPlayerIDSelector = selectPlayerID;
export const getReservedGameIDs = selectReservedGameIDs;
export const getAllPlayers = selectAllPlayers;
export const getWinningPlayer = selectWinningPlayer;
export const getWinningWords = selectWinningWords;
export const getRemainingTiles = selectRemainingTiles;
export const getPlayerTiles = selectPlayerTiles;