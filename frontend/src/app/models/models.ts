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
    tiles: Tile[];
}

// how to model this?
export interface players {
    // player 1: tile[]
    // player 2 : tile[]
}

// for message: 'Game loaded.'
// data that comes back from the socket endpoint for player join. 
export interface GameData {
    id: string;
    num_players: number;
    players: any;  // object of player: tile[]
    state: string; // enum??
    tiles_remaining: number;
    winning_player: string;
    winning_words: string; // ?
    // example data:
    // payload: "{"id": "827663", "state": "IDLE", "num_players": null, "tiles_remaining": 144, "players": {}, "winning_words": null, "winning_player": null}"
}