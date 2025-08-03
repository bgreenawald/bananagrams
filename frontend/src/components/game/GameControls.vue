<template>
  <div class="game-controls">
    <div class="controls-left">
      <h2 class="game-title">Bananagrams - Game {{ gameId }}</h2>
      <div class="game-info">
        <span class="tiles-remaining">Tiles Remaining: {{ tilesRemaining }}</span>
        <span class="player-count">Players: {{ players.length }}</span>
      </div>
    </div>
    
    <div class="controls-center">
      <button
        @click="handlePeel"
        :disabled="!canPeel"
        class="btn btn-primary"
      >
        Peel
      </button>
      
      <button
        @click="handleBananagrams"
        :disabled="!canCallBananagrams"
        class="btn btn-success"
      >
        Bananagrams!
      </button>
      
      <button
        @click="handleSelectAll"
        class="btn btn-secondary"
      >
        Select All
      </button>
    </div>
    
    <div class="controls-right">
      <button
        @click="confirmReset"
        class="btn btn-danger"
      >
        Reset Board
      </button>
      
      <button
        @click="confirmNewGame"
        class="btn btn-secondary"
      >
        New Game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useBoardStore } from '@/stores/board'
import { useUIStore } from '@/stores/ui'
import { useSocketStore } from '@/stores/socket'
import { useGameLogic } from '@/composables/useGameLogic'
import { useErrorHandler } from '@/composables/useErrorHandler'

const gameStore = useGameStore()
const playerStore = usePlayerStore()
const boardStore = useBoardStore()
const uiStore = useUIStore()
const socketStore = useSocketStore()
const { validateBoard, extractWords } = useGameLogic()
const { handleError } = useErrorHandler('Game Controls')

const gameId = computed(() => gameStore.gameId)
const tilesRemaining = computed(() => gameStore.tilesRemaining)
const players = computed(() => gameStore.players)

const canPeel = computed(() => {
  return gameStore.isActive && 
         playerStore.benchTiles.length === 0 && 
         boardStore.getOccupiedCells().length > 0
})

const canCallBananagrams = computed(() => {
  return gameStore.isEndgame && 
         playerStore.benchTiles.length === 0 && 
         boardStore.getOccupiedCells().length > 0
})

function handlePeel() {
  try {
    if (!canPeel.value) return

    const validation = validateBoard()
    if (!validation.valid) {
      uiStore.showModal('error', { message: validation.error })
      return
    }

    socketStore.peel(gameId.value)
  } catch (error) {
    handleError(error, 'Peel action')
  }
}

function handleBananagrams() {
  try {
    if (!canCallBananagrams.value) return

    const validation = validateBoard()
    if (!validation.valid) {
      uiStore.showModal('error', { message: validation.error })
      return
    }

    const words = extractWords()
    if (words.length === 0) {
      uiStore.showModal('error', { message: 'No valid words found on board' })
      return
    }

    socketStore.callBananagrams(gameId.value, words)
  } catch (error) {
    handleError(error, 'Bananagrams call')
  }
}

function handleSelectAll() {
  // Select all tiles on board
  const boardTiles = boardStore.getAllTiles()
  boardTiles.forEach(({ tile }) => {
    playerStore.selectTile(tile.id)
  })
}

function confirmReset() {
  uiStore.showModal('reset')
}

function confirmNewGame() {
  uiStore.showModal('newGame')
}
</script>

<style scoped lang="scss">
.game-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-bottom: 2px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.controls-left {
  flex: 1;
}

.game-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.game-info {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.controls-center {
  display: flex;
  gap: 0.75rem;
}

.controls-right {
  display: flex;
  gap: 0.75rem;
  flex: 1;
  justify-content: flex-end;
}

.btn-success {
  background-color: #28a745;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #218838;
  }
}
</style>