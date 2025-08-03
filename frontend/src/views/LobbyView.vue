<template>
  <div class="lobby-container">
    <div class="lobby-content">
      <h1 class="title">Game Lobby</h1>
      <p class="game-id">Game ID: {{ gameId }}</p>

      <div v-if="!playerName" class="name-form">
        <h2>Enter your name to join</h2>
        <div class="input-group">
          <input
            v-model="nameInput"
            type="text"
            placeholder="Your name"
            @keyup.enter="joinGame"
            maxlength="20"
          />
          <button @click="joinGame" :disabled="!nameInput.trim()">
            Join Game
          </button>
        </div>
      </div>

      <div v-else class="lobby-info">
        <div class="players-section">
          <h2>Players ({{ players.length }})</h2>
          <ul class="players-list">
            <li v-for="player in players" :key="player.id" class="player-item">
              <span class="player-name">{{ player.name }}</span>
              <span v-if="player.tile_count !== undefined" class="tile-count">
                {{ player.tile_count }} tiles
              </span>
            </li>
          </ul>
        </div>

        <div class="actions">
          <button
            v-if="gameState === 'IDLE'"
            @click="startGame"
            :disabled="players.length < 2"
            class="start-btn"
          >
            {{ players.length < 2 ? 'Waiting for players...' : 'Start Game' }}
          </button>
          <p v-else-if="gameState === 'ACTIVE'" class="status">
            Game in progress...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useSocketStore } from '@/stores/socket'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const playerStore = usePlayerStore()
const socketStore = useSocketStore()

const gameId = computed(() => route.params.id as string)
const nameInput = ref('')
const playerName = computed(() => playerStore.playerName)
const players = computed(() => gameStore.players)
const gameState = computed(() => gameStore.gameState?.state)

onMounted(() => {
  gameStore.setGameId(gameId.value)
  
  const savedName = localStorage.getItem('playerName')
  if (savedName) {
    playerStore.setPlayerName(savedName)
    joinGameWithName(savedName)
  }
})

watch(() => gameStore.gameState?.state, (newState) => {
  if (newState === 'ACTIVE') {
    router.push({ name: 'game', params: { id: gameId.value } })
  } else if (newState === 'OVER') {
    router.push({ name: 'gameover', params: { id: gameId.value } })
  }
})

const joinGame = () => {
  const name = nameInput.value.trim()
  if (!name) return
  
  playerStore.setPlayerName(name)
  localStorage.setItem('playerName', name)
  joinGameWithName(name)
}

const joinGameWithName = (name: string) => {
  socketStore.joinGame(gameId.value, name)
}

const startGame = () => {
  if (players.value.length >= 2) {
    socketStore.startGame(gameId.value)
  }
}
</script>

<style scoped lang="scss">
.lobby-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.lobby-content {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.game-id {
  font-size: 1.2rem;
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 600;
}

.name-form {
  text-align: center;

  h2 {
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 1.5rem;
  }
}

.input-group {
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #4CAF50;
    }
  }

  button {
    padding: 0.75rem 1.5rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background-color: #45a049;
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
}

.lobby-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.players-section {
  h2 {
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 1rem;
  }
}

.players-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.player-item {
  padding: 0.75rem 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-name {
  font-weight: 500;
  color: #333;
}

.tile-count {
  font-size: 0.9rem;
  color: #666;
}

.actions {
  text-align: center;
}

.start-btn {
  width: 100%;
  padding: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}

.status {
  font-size: 1.1rem;
  color: #2196F3;
  font-weight: 600;
}
</style>