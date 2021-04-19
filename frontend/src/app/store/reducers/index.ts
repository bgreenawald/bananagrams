import * as GameReducers from './game.reducer';
import * as UserReducers from './user.reducer';
import * as RouterReducers from './router.reducer';

import * as Models from './../../models';
import { ActionReducerMap } from '@ngrx/store';


export const reducers: ActionReducerMap<any> = {
    gameReducer: GameReducers.gameReducer,
    userReducer: UserReducers.userReducer,
};
