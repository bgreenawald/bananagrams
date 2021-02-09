import { Action, createReducer, on, ActionsSubject } from '@ngrx/store';
import * as Actions from './../actions';
import { UserData } from '../../models';

const initialState: any = {
    selectedTiles: [],
    playerID: '',
    loaded: false,
    loading: false,
    gameData: {}
}

export function userReducer(state: any = initialState, action: Actions.UserActions): any {
    switch (action.type) {
        case Actions.UPDATE_PLAYER_ID:
            return {
                ...state,
                playerID: action.playerID
            }
        default:
            return state;
    }
}