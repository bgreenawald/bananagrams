<template>
  <div class="landing-container">
    <div class="landing-content">
      <h1 class="title">Bananagrams</h1>
      <p class="subtitle">Create or join a game</p>
      
      <div class="game-form">
        <div class="input-group">
          <label for="game-id">Game ID</label>
          <div class="input-row">
            <input
              id="game-id"
              v-model="gameId"
              type="text"
              maxlength="4"
              placeholder="Enter 4-digit ID"
              @input="validateGameId"
            />
            <button @click="generateGameId" class="generate-btn">
              Generate
            </button>
          </div>
          <p v-if="error" class="error">{{ error }}</p>
        </div>

        <button
          @click="createGame"
          :disabled="!isValidGameId"
          class="create-btn"
        >
          Create New Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

const gameId = ref('')
const error = ref('')

const isValidGameId = computed(() => {
  return /^\d{4}$/.test(gameId.value)
})

const validateGameId = () => {
  gameId.value = gameId.value.replace(/\D/g, '').slice(0, 4)
  error.value = ''
}

const generateGameId = async () => {
  await gameStore.loadReservedGameIds()
  const reservedIds = gameStore.unavailableIds || []
  
  let newId: string
  do {
    newId = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  } while (reservedIds.includes(newId))
  
  gameId.value = newId
  error.value = ''
}

const createGame = () => {
  if (!isValidGameId.value) {
    error.value = 'Please enter a valid 4-digit game ID'
    return
  }
  
  gameStore.setGameId(gameId.value)
  router.push({ name: 'lobby', params: { id: gameId.value } })
}
</script>

<style scoped lang="scss">
.landing-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.landing-content {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
}

.game-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #333;
}

.input-row {
  display: flex;
  gap: 0.5rem;
}

input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
}

.generate-btn {
  padding: 0.75rem 1.5rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1976D2;
  }
}

.create-btn {
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

.error {
  color: #f44336;
  font-size: 0.9rem;
}
</style>