import { Action, createReducer, on, ActionsSubject } from '@ngrx/store';
import * as Actions from './../actions/game.actions';
import * as Models from './../../models';


// The game state syncs it's data with the server.
const initialState: any = {
    selectedTiles: [],
    playerID: '',
    loaded: false,  // TODO move the loading booleans into the user reducers ?
    loading: false,
    gameData: {}
}

export function gameReducer(state: Models.GameState = initialState, action: Actions.GameActionTypes): any {
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
                loaded: true
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
        case Actions.SET_GAME_ID:
            return {
                ...state,
                gameData: {
                    ...state.gameData,
                    id: action.gameID
                }
            }
        case Actions.SET_RESERVED_GAME_IDS:
            return {
                ...state,
                gameData: {
                    ...state.gameData,
                    unavailableIDs: action.gameIDs
                }
            }
        default:
            return state;
    }
}