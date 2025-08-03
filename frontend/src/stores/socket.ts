import { defineStore } from "pinia";
import { ref } from "vue";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "./game";
import { usePlayerStore } from "./player";
import type { GameState, Tile } from "@/types";

export const useSocketStore = defineStore("socket", () => {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();

  // Helper function to update player tiles while preserving existing tile IDs and board state
  function updatePlayerTiles(playerTileLetters: string[], currentPlayerName: string) {
    console.log(`[TILE DEBUG] updatePlayerTiles called for ${currentPlayerName}`);
    console.log(`[TILE DEBUG] Server sent ${playerTileLetters.length} tiles:`, playerTileLetters);
    console.log(`[TILE DEBUG] Current tiles before update:`, playerStore.tiles.length);
    
    const existingTiles = playerStore.tiles;
    const newTiles: Tile[] = [];
    const usedTileIds = new Set<string>();
    
    // Create new tiles while preserving board state
    for (let index = 0; index < playerTileLetters.length; index++) {
      const letter = playerTileLetters[index];
      
      // Try to find existing tile with same letter that's not already used
      const existingTile = existingTiles.find(t => 
        t.letter === letter && 
        !usedTileIds.has(t.id)
      );
      
      if (existingTile) {
        // Reuse existing tile, preserve its board state
        newTiles.push(existingTile);
        usedTileIds.add(existingTile.id);
      } else {
        // Create new tile
        const newTile = {
          letter,
          id: `${currentPlayerName}-${index}-${Date.now()}`,
          onBoard: false
        };
        newTiles.push(newTile);
        usedTileIds.add(newTile.id);
      }
    }

    console.log(`[TILE DEBUG] Setting ${newTiles.length} tiles in store`);
    console.log(`[TILE DEBUG] Board tiles preserved:`, newTiles.filter(t => t.onBoard).length);
    playerStore.setTiles(newTiles);
    console.log(`[TILE DEBUG] After setTiles, store has:`, playerStore.tiles.length);
  }

  function connect() {
    if (socket.value) return; // Prevent creating multiple socket instances

    socket.value = io("/", {
      transports: ["websocket"],
      upgrade: false,
    });

    socket.value.on("connect", () => {
      console.log("Socket connected");
      connected.value = true;
    });

    socket.value.on("disconnect", () => {
      console.log("Socket disconnected");
      connected.value = false;
    });

    socket.value.on(
      "render_game",
      (data: { status_code: number; message: string; payload: string }) => {
        console.log("[EVENT DEBUG] render_game event received:", data.message);
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
            console.error("Failed to parse game data:", error);
          }
        } else if (data.status_code === 400) {
          gameStore.setError(data.message);
        }
      }
    );

    socket.value.on("game_state", (data: GameState) => {
      console.log("[EVENT DEBUG] game_state event received");
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
      console.log("[EVENT DEBUG] player_tiles event received:", data);
      playerStore.setTiles(data.tiles);
    });

    socket.value.on("tile_update", (data: { tiles: Tile[] }) => {
      console.log("[EVENT DEBUG] tile_update event received:", data);
      playerStore.updateTiles(data.tiles);
    });

    socket.value.on("error", (data: { message: string }) => {
      console.error("Socket error:", data.message);
      gameStore.setError(data.message);
    });

    socket.value.on(
      "game_over",
      (data: { winner: string; words: string[] }) => {
        console.log("Game over:", data);
        gameStore.updateGameState({
          state: "OVER",
          winner: data.winner,
          winningWords: data.words,
        });
      }
    );
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
      console.error("Socket not connected");
      return;
    }

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
  }

  function createTestGame(gameId: string, playerName: string) {
    if (!socket.value?.connected) {
      console.error("Socket not connected");
      return;
    }

    // First join the room
    socket.value.emit("join", {
      name: gameId,
    });

    // Create test game with auto-join
    socket.value.emit("create_test_game", {
      name: gameId,
      player_id: playerName,
    });
  }

  function startGame(gameId: string) {
    if (!socket.value?.connected) return;

    socket.value.emit("start_game", {
      name: gameId,
    });
  }

  function placeTile(gameId: string, tileId: string, row: number, col: number) {
    if (!socket.value?.connected) return;

    socket.value.emit("place_tile", {
      game_id: gameId,
      tile_id: tileId,
      row,
      col,
    });
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
    if (!socket.value?.connected) return;

    socket.value.emit("peel", {
      name: gameId,
    });
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
