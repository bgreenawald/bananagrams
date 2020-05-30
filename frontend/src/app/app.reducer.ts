import { Action, createReducer, on } from '@ngrx/store';
import * as Actions from './app.actions';

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

const _reducer = createReducer(initialState,
    on(Actions.updateStore, ((state, { payload }) => ({ ...state, ...payload })))
);

export function reducer(state, action) {
    return _reducer(state, action)
}