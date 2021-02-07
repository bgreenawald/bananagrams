import { Action, createReducer, on } from '@ngrx/store';
import * as Actions from './../actions/game.actions';
import { UserData } from '../../models/models';

const initialState: any = {
    gameID: 'testing',
    selectedTiles: [],
    playerID: '',
    loaded: false,
    loading: false
}

// export function reducer(state = [initialState], action: AllActions.Actions) {
//     switch (action.type) {
//         case AllActions.UPDATE_STORE:
//             return [...state, action.payload];
//         default:
//             return state;
//     }
// }

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
                ...action.payload
            }
        case Actions.LOAD_GAME_FAIL:
            return {
                ...state,
                loading: false,
                loaded: true,
                ...action.payload
            }
        default:
            return state;
    }
}

// const _reducer = createReducer(initialState,
//     on(Actions.UPDATE_STORE, ((state, { payload }) => ({ ...state, ...payload })))
// );

// export function reducer(state, action) {
//     return _reducer(state, action)
// }

// a slice of the state from the entire state tree that the reducer manages
// <TODO: type the entire data object>
export interface GameState {
    loaded: boolean;
    loading: boolean;
    // other data
}