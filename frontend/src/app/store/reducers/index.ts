import * as GameReducers from './game.reducer';
import * as Models from './../../models/models';
import { ActionReducerMap } from '@ngrx/store';

// TODO
// export interface GameState {
//     userData: GameReducers.GameState;
//     gameData: any;
// }

export const reducers: ActionReducerMap<any> = {
    game: GameReducers.gameReducer
}