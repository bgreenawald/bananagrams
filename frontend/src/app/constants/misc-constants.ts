export enum SocketSuccessResponses {
    GameLoaded = 'Game loaded.',
    AddedPlayer = 'Added player p1 to game.',
    GameStarted = 'Game started.',
    Peel = 'New tile given out.',
    Swap = 'Performance swap for player p1.',
    Bananagrams = 'Bananagrams.',
    Continued = 'continued',
    Reset = 'reset'
}

export enum SocketFailResponses {
    WordsRequired = "'words' is a required property"
}

export enum GameViews {
    ModalResetConfirm = 'Ask User to Confirm Reset Game',
    ModalGameOver = 'Announce Game Over. Ask to play again.',
    GameLoading = 'Loading State'
}
