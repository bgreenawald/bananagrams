import { Action, createReducer, on } from '@ngrx/store';
import * as GameActions from './../actions/game.actions';

const initialState: any = {
    gameID: 'testing',
    selectedTiles: [],
    playerID: ''
}

// export function reducer(state = [initialState], action: AllActions.Actions) {
//     switch (action.type) {
//         case AllActions.UPDATE_STORE:
//             return [...state, action.payload];
//         default:
//             return state;
//     }
// }

export function gameReducer(state: any = [initialState], action: GameActions.Actions) {
    switch (action.type) {
        case GameActions.UPDATE_STORE:
            return [...state, action.payload];
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