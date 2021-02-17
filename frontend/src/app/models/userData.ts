import * as Constants from './../constants';

export interface UserState {
    // QUESTION: difference between type and interface?
    playerID: String;
    tiles: String[];
    // maybe add a 2d array to keep track of which tiles were where? (must store in local storage)
    currentView: string // QUESTION: can I bind the enum here? so I can restrict string values to only what's in the GameViews enum?
}

export type validViews = Constants.GameViews.GameLoading | Constants.GameViews.ModalGameOver | Constants.GameViews.ModalResetConfirm;