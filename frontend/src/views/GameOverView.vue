<template>
  <div class="gameover-container">
    <div class="gameover-content">
      <h1 class="title">Game Over!</h1>
      
      <div v-if="winner" class="winner-section">
        <h2>Winner: {{ winner }}</h2>
        
        <div v-if="winningWords.length > 0" class="words-section">
          <h3>Winning Words:</h3>
          <div class="words-grid">
            <span v-for="word in winningWords" :key="word" class="word-chip">
              {{ word }}
            </span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="newGame" class="btn btn-primary">
          New Game
        </button>
        <button @click="returnToLobby" class="btn btn-secondary">
          Return to Lobby
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'

const router = useRouter()
const gameStore = useGameStore()
const playerStore = usePlayerStore()

const winner = computed(() => gameStore.winner)
const winningWords = computed(() => gameStore.winningWords)

function newGame() {
  gameStore.reset()
  playerStore.reset()
  router.push({ name: 'landing' })
}

function returnToLobby() {
  playerStore.tiles = []
  playerStore.clearSelection()
  router.push({ name: 'lobby', params: { id: gameStore.gameId } })
}
</script>

<style scoped lang="scss">
.gameover-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.gameover-content {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.title {
  font-size: 3rem;
  color: #333;
  margin-bottom: 2rem;
}

.winner-section {
  margin-bottom: 2rem;

  h2 {
    font-size: 2rem;
    color: #4CAF50;
    margin-bottom: 1.5rem;
  }
}

.words-section {
  text-align: left;

  h3 {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1rem;
    text-align: center;
  }
}

.words-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.word-chip {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}
</style>