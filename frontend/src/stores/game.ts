import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { GameState, Player } from "@/types";

export const useGameStore = defineStore("game", () => {
  const gameId = ref<string>("");
  const gameState = ref<GameState | null>(null);
  const unavailableIds = ref<string[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const players = computed(() => {
    if (!gameState.value?.players) return [];

    // Transform backend players object into Player array
    return Object.entries(gameState.value.players).map(([playerId, tiles]) => ({
      id: playerId,
      name: playerId, // In the backend, player_id is the name
      ready: gameState.value?.state !== "IDLE",
      tile_count: Array.isArray(tiles) ? tiles.length : 0,
    }));
  });
  const tilesRemaining = computed(() => gameState.value?.tiles_remaining || 0);
  const winner = computed(() => gameState.value?.winning_player);
  const winningWords = computed(() => gameState.value?.winning_words || []);
  const isActive = computed(() => gameState.value?.state === "ACTIVE");
  const isEndgame = computed(() => gameState.value?.state === "ENDGAME");
  const isOver = computed(() => gameState.value?.state === "OVER");

  function setGameId(id: string) {
    gameId.value = id;
  }

  function updateGameState(data: Partial<GameState>) {
    if (!gameState.value) {
      gameState.value = data as GameState;
    } else {
      gameState.value = { ...gameState.value, ...data };
    }
  }

  function setPlayers(playerList: Player[]) {
    if (gameState.value) {
      // Convert Player array to backend format if needed
      const playersRecord: Record<string, string[]> = {};
      playerList.forEach((player) => {
        playersRecord[player.id] = player.tiles?.map((t) => t.letter) || [];
      });
      gameState.value.players = playersRecord;
    }
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading;
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage;
  }

  async function loadReservedGameIds() {
    try {
      setLoading(true);
      const response = await fetch("/api/games/reserved");
      const data = await response.json();
      unavailableIds.value = data.reserved_ids || [];
    } catch (err) {
      console.error("Failed to load reserved game IDs:", err);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    gameId.value = "";
    gameState.value = null;
    error.value = null;
  }

  return {
    gameId,
    gameState,
    unavailableIds,
    loading,
    error,
    players,
    tilesRemaining,
    winner,
    winningWords,
    isActive,
    isEndgame,
    isOver,
    setGameId,
    updateGameState,
    setPlayers,
    setLoading,
    setError,
    loadReservedGameIds,
    reset,
  };
});
