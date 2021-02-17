// THIS REDUCER IS UNUSED AS OF NOW 2/15/21
import { Action, createReducer, on, ActionsSubject } from '@ngrx/store';
import * as Actions from './../actions';
import * as Models from '../../models';
// import * as Constants from '../../constants';

// The user state only contains data applicable to the frontend. 
// For refresh persistence, select bits of the state are stored in local storage (ex: previously used playerID)
const initialState: Models.UserState = {
    playerID: null,
    tiles: [],
    currentView: "Loading State"
}

export function userReducer(
    state: any = initialState,
    action: Actions.UserActions
): any {
    switch (action.type) {
        case Actions.UPDATE_PLAYER_ID:
            return {
                ...state,
                playerID: action.playerID
            }

        case Actions.CALL_BANANAGRAMS:
            return state;

        case Actions.RESET_GAME:
            return state;  // QUESTION: what is the best practice with this type of socket request - where the request doesn't map to the response?  Should show a loading circle??

        default:
            return state;
    }
}