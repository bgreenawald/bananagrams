import { Action, createReducer, on, ActionsSubject } from '@ngrx/store';
import * as Actions from './../actions/game.actions';
import { UserData } from '../../models';

const initialState: any = {
    selectedTiles: [],
    playerID: '',
    loaded: false,
    loading: false,
    gameData: {}
}

export function gameReducer(state: any = initialState, action: Actions.GameActions): any {
    switch (action.type) {
        case Actions.UPDATE_STORE:
            return { ...state, ...action.payload };
        case Actions.LOADING:
            return {
                ...state,
                loading: true,
                loaded: false,
                ...action.payload
            }
        case Actions.LOAD_GAME_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                reservedGameIDs: action.payload
            }
        case Actions.LOAD_GAME_FAIL:
            return {
                ...state,
                loading: false,
                loaded: true,
                error: action.errorMessage
            }
        case Actions.UPDATE_SOCKET_DATA:
            console.log('Socket message received:', action.message)
            return {
                ...state,
                gameData: action.payload
            }
        case Actions.SET_PLAYER_ID:
            return {
                ...state,
                playerID: action.playerName
            }
        default:
            return state;
    }
}

// a slice of the state from the entire state tree that the reducer manages
// <TODO: type the entire data object>
export interface GameState {
    loaded: boolean;
    loading: boolean;
    // other data
}

export const getGameDataLoading = (state: GameState) => state.loading;
export const getGameLoadedState = (state: GameState) => state.loaded;
// export const getGameData = (state: GameState) => state.gameData;