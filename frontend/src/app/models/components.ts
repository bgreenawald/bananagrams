export interface Tile {
    letter: string;
    id: number;
}

export enum Modals {
    startNewGameConfirm = 'startNewGameConfirm',
    resetConfirm = 'resetConfirm'
}

export interface Cell {
    row: number;
    column: number;
}

export interface UserData { // TODO: Can remove??
    name: string;
    id: string;
    tiles: Tile[];
}

// how to model this?
export interface players {
    // player 1: tile[]
    // player 2 : tile[]
}
