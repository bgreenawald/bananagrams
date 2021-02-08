import { Action, createReducer, on, ActionsSubject } from '@ngrx/store';
import * as Actions from './../actions/game.actions';
import { UserData } from '../../models/models';

const initialState: any = {
    gameID: 'testing',
    selectedTiles: [],
    playerID: '',
    loaded: false,
    loading: false
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
                ...action.payload
            }
        case Actions.UPDATE_SOCKET_DATA:
            console.log('Socket message received:', action.message)
            return {
                ...state,
                loading: false,
                loaded: true,
                gameData: action.payload
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