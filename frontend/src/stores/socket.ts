import { defineStore } from "pinia";
import { ref } from "vue";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "./game";
import { usePlayerStore } from "./player";
import { useErrorHandler } from "@/composables/useErrorHandler";
import { logger } from "@/utils/logger";
import type { GameState, Tile } from "@/types";

export const useSocketStore = defineStore("socket", () => {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const connecting = ref(false);
  const connectionError = ref<string | null>(null);
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
  const { handleError, handleSocketError } = useErrorHandler('WebSocket');

  // Helper function to update player tiles while preserving existing tile IDs and board state
  function updatePlayerTiles(playerTileLetters: string[], currentPlayerName: string) {
    try {
      const existingTiles = [...playerStore.tiles]; // Create a copy to avoid mutations
      const boardTiles = existingTiles.filter(t => t.onBoard);
      const benchTiles = existingTiles.filter(t => !t.onBoard);
      
      // Board tiles should be preserved as-is
      const newTiles: Tile[] = [...boardTiles];
      
      // Create a frequency map of letters we need to fulfill
      const neededLetters = new Map<string, number>();
      playerTileLetters.forEach(letter => {
        neededLetters.set(letter, (neededLetters.get(letter) || 0) + 1);
      });
      
      // Subtract board tiles from needed letters (they're already placed)
      boardTiles.forEach(tile => {
        const current = neededLetters.get(tile.letter) || 0;
        if (current > 0) {
          neededLetters.set(tile.letter, current - 1);
        }
      });
      
      // Create bench tiles to fulfill remaining needs
      const availableBenchTiles = [...benchTiles];
      
      neededLetters.forEach((count, letter) => {
        for (let i = 0; i < count; i++) {
          // Try to reuse existing bench tile with same letter
          const existingIndex = availableBenchTiles.findIndex(t => t.letter === letter);
          if (existingIndex >= 0) {
            const reusedTile = availableBenchTiles.splice(existingIndex, 1)[0];
            newTiles.push(reusedTile);
          } else {
            // Create new tile for bench
            const newTile: Tile = {
              letter,
              id: `${currentPlayerName}-${letter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              onBoard: false
            };
            newTiles.push(newTile);
          }
        }
      });
      
      // Validate tile count consistency
      if (newTiles.length !== playerTileLetters.length) {
        logger.warn(
          `Tile count mismatch: expected ${playerTileLetters.length}, got ${newTiles.length}`,
          'Tile System',
          { expected: playerTileLetters.length, actual: newTiles.length, boardTiles: boardTiles.length }
        );
      }
      
      playerStore.setTiles(newTiles);
    } catch (error) {
      handleError(error, 'Tile state update');
      // Fallback: create entirely new tiles
      const fallbackTiles: Tile[] = playerTileLetters.map((letter, index) => ({
        letter,
        id: `${currentPlayerName}-fallback-${index}-${Date.now()}`,
        onBoard: false
      }));
      playerStore.setTiles(fallbackTiles);
    }
  }

  function waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 15000);

      const checkConnection = () => {
        if (connected.value) {
          clearTimeout(timeout);
          resolve();
        } else if (connectionError.value) {
          clearTimeout(timeout);
          reject(new Error(connectionError.value));
        } else if (!connecting.value && !connected.value) {
          clearTimeout(timeout);
          reject(new Error("Connection failed"));
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      
      checkConnection();
    });
  }

  function connect(): Promise<void> {
    if (socket.value?.connected) {
      return Promise.resolve();
    }
    
    if (connecting.value) {
      // Return existing connection promise
      return waitForConnection();
    }

    connecting.value = true;
    connectionError.value = null;

    if (socket.value) {
      socket.value.disconnect();
    }

    socket.value = io("/", {
      transports: ["websocket"],
      upgrade: false,
      timeout: 10000,
    });

    socket.value.on("connect", () => {
      logger.socketEvent("connect");
      connected.value = true;
      connecting.value = false;
      connectionError.value = null;
    });

    socket.value.on("disconnect", () => {
      logger.socketEvent("disconnect");
      connected.value = false;
      connecting.value = false;
    });

    socket.value.on("connect_error", (error) => {
      logger.socketError(error, "Connection");
      connected.value = false;
      connecting.value = false;
      connectionError.value = error.message || "Connection failed";
      handleSocketError(error, "Connection");
    });

    socket.value.on(
      "render_game",
      (data: { status_code: number; message: string; payload: string }) => {
        logger.socketEvent("render_game", { message: data.message, statusCode: data.status_code });
        if (data.status_code === 200 && data.payload) {
          try {
            const gameData = JSON.parse(data.payload);
            gameStore.updateGameState(gameData);

            // Extract current player's tiles and convert to Tile objects
            const currentPlayerName = playerStore.playerName;
            if (
              currentPlayerName &&
              gameData.players &&
              gameData.players[currentPlayerName]
            ) {
              const playerTileLetters: string[] =
                gameData.players[currentPlayerName];
              updatePlayerTiles(playerTileLetters, currentPlayerName);
            }
          } catch (error) {
            handleError(error, "Game data parsing");
          }
        } else if (data.status_code === 400) {
          gameStore.setError(data.message);
        }
      }
    );

    socket.value.on("game_state", (data: GameState) => {
      logger.socketEvent("game_state", data);
      gameStore.updateGameState(data);

      // Extract current player's tiles and convert to Tile objects
      const currentPlayerName = playerStore.playerName;
      if (
        currentPlayerName &&
        data.players &&
        data.players[currentPlayerName]
      ) {
        const playerTileLetters: string[] = data.players[currentPlayerName];
        updatePlayerTiles(playerTileLetters, currentPlayerName);
      }
    });

    socket.value.on("player_tiles", (data: { tiles: Tile[] }) => {
      logger.socketEvent("player_tiles", data);
      playerStore.setTiles(data.tiles);
    });

    socket.value.on("tile_update", (data: { tiles: Tile[] }) => {
      logger.socketEvent("tile_update", data);
      playerStore.updateTiles(data.tiles);
    });

    socket.value.on("error", (data: { message: string }) => {
      logger.socketError(data, "Socket error");
      gameStore.setError(data.message);
    });

    socket.value.on(
      "game_over",
      (data: { winner: string; words: string[] }) => {
        logger.gameEvent("Game over", data);
        gameStore.updateGameState({
          state: "OVER",
          winner: data.winner,
          winningWords: data.words,
        });
      }
    );

    return waitForConnection();
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      connected.value = false;
    }
  }

  function joinGame(
    gameId: string,
    playerName: string,
    testMode: boolean = false
  ) {
    if (!socket.value?.connected) {
      const error = new Error("Socket not connected");
      handleSocketError(error, "Join Game");
      return;
    }

    try {
      // First join the room
      socket.value.emit("join", {
        name: gameId,
      });

      // Then load/create the game (with optional test mode)
      socket.value.emit("load_game", {
        name: gameId,
        test_mode: testMode,
      });

      // Finally add the player to the game
      socket.value.emit("player_join", {
        name: gameId,
        player_id: playerName,
      });
    } catch (error) {
      handleSocketError(error, "Join Game");
    }
  }

  function createTestGame(gameId: string, playerName: string) {
    if (!socket.value?.connected) {
      const error = new Error("Socket not connected");
      handleSocketError(error, "Create Test Game");
      return;
    }

    try {
      // First join the room
      socket.value.emit("join", {
        name: gameId,
      });

      // Create test game with auto-join
      socket.value.emit("create_test_game", {
        name: gameId,
        player_id: playerName,
      });
    } catch (error) {
      handleSocketError(error, "Create Test Game");
    }
  }

  function startGame(gameId: string) {
    if (!socket.value?.connected) {
      handleSocketError(new Error("Socket not connected"), "Start Game");
      return;
    }

    try {
      socket.value.emit("start_game", {
        name: gameId,
      });
    } catch (error) {
      handleSocketError(error, "Start Game");
    }
  }

  function placeTile(gameId: string, tileId: string, row: number, col: number) {
    if (!socket.value?.connected) {
      handleSocketError(new Error("Socket not connected"), "Place Tile");
      return;
    }

    try {
      socket.value.emit("place_tile", {
        game_id: gameId,
        tile_id: tileId,
        row,
        col,
      });
    } catch (error) {
      handleSocketError(error, "Place Tile");
    }
  }

  function moveTile(
    gameId: string,
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) {
    if (!socket.value?.connected) return;

    socket.value.emit("move_tile", {
      game_id: gameId,
      from_row: fromRow,
      from_col: fromCol,
      to_row: toRow,
      to_col: toCol,
    });
  }

  function swapTile(gameId: string, letter: string) {
    if (!socket.value?.connected) return;

    socket.value.emit("swap", {
      name: gameId,
      player_id: playerStore.playerName,
      letter: letter,
    });
  }

  function peel(gameId: string) {
    if (!socket.value?.connected) {
      handleSocketError(new Error("Socket not connected"), "Peel");
      return;
    }

    try {
      socket.value.emit("peel", {
        name: gameId,
      });
    } catch (error) {
      handleSocketError(error, "Peel");
    }
  }

  function callBananagrams(gameId: string, words: string[]) {
    if (!socket.value?.connected) return;

    socket.value.emit("bananagrams", {
      name: gameId,
      player_id: playerStore.playerName,
      words: words,
    });
  }

  function validateWords(
    gameId: string,
    playerId: string,
    validWords: string[]
  ) {
    if (!socket.value?.connected) return;

    socket.value.emit("validate_words", {
      game_id: gameId,
      player_id: playerId,
      valid_words: validWords,
    });
  }

  function resetBoard(gameId: string) {
    if (!socket.value?.connected) return;

    socket.value.emit("reset", {
      name: gameId,
    });
  }

  return {
    socket,
    connected,
    connecting,
    connectionError,
    connect,
    disconnect,
    joinGame,
    createTestGame,
    startGame,
    placeTile,
    moveTile,
    swapTile,
    peel,
    callBananagrams,
    validateWords,
    resetBoard,
  };
});
