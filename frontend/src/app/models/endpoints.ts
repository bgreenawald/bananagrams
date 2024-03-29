// for message: 'Game loaded.'
// data that comes back from the socket endpoint for player join.

// JSON object from the socket server
// example data:
// payload: "{"id": "827663", "state": "IDLE", "num_players": null, "tiles_remaining": 144, "players": {}, "winning_words": null, "winning_player": null}"
export interface GameData {
    id: string; // gameID
    num_players: number;
    players: any;  // object of player: tile[]
    state: string; // enum??
    tiles_remaining: number;
    winning_player: string;
    winning_words: any[]; // ?
    unavailableIDs: string[];
}

// for front end use only
export interface GameState {
    gameData: GameData;
    loaded: boolean;
    loading: boolean;
    playerID: string;
    unavailableIDs: string[];
}

export interface RawSocketResponse {
    message: string;
    status_code: number;
    payload: any;
}
