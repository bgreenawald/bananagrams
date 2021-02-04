export interface Tile {
    letter: string;
    id: number;
}

export enum Modals {
    startNewGameConfirm = "startNewGameConfirm",
    resetConfirm = "resetConfirm"
}

export interface Cell {
    row: number;
    column: number;
}

export interface UserData {
    name: string;
    id: string;
}