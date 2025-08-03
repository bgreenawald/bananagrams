<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modalType" class="modal-backdrop" @click="handleBackdropClick">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ modalTitle }}</h3>
            <button @click="close" class="close-btn">&times;</button>
          </div>
          
          <div class="modal-body">
            <!-- Reset Confirmation -->
            <div v-if="modalType === 'reset'">
              <p>Are you sure you want to reset the board? All tiles will be returned to your bench.</p>
              <div class="modal-actions">
                <button @click="handleReset" class="btn btn-danger">Reset</button>
                <button @click="close" class="btn btn-secondary">Cancel</button>
              </div>
            </div>

            <!-- New Game Confirmation -->
            <div v-else-if="modalType === 'newGame'">
              <p>Are you sure you want to start a new game? Current game progress will be lost.</p>
              <div class="modal-actions">
                <button @click="handleNewGame" class="btn btn-primary">New Game</button>
                <button @click="close" class="btn btn-secondary">Cancel</button>
              </div>
            </div>

            <!-- Word Review -->
            <div v-else-if="modalType === 'wordReview'">
              <p>{{ modalData?.playerName }} called Bananagrams! Review their words:</p>
              <div class="words-review">
                <div v-for="(word, index) in modalData?.words" :key="index" class="word-item">
                  <span class="word">{{ word }}</span>
                  <button @click="toggleWord(index)" class="word-btn" :class="{ invalid: invalidWords.has(index) }">
                    {{ invalidWords.has(index) ? '✗' : '✓' }}
                  </button>
                </div>
              </div>
              <div class="modal-actions">
                <button @click="submitReview" class="btn btn-primary">Submit Review</button>
              </div>
            </div>

            <!-- Error Message -->
            <div v-else-if="modalType === 'error'">
              <p>{{ modalData?.message }}</p>
              <div class="modal-actions">
                <button @click="close" class="btn btn-primary">OK</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useBoardStore } from '@/stores/board'
import { useSocketStore } from '@/stores/socket'

const router = useRouter()
const uiStore = useUIStore()
const gameStore = useGameStore()
const playerStore = usePlayerStore()
const boardStore = useBoardStore()
const socketStore = useSocketStore()

const modalType = computed(() => uiStore.modalType)
const modalData = computed(() => uiStore.modalData)
const invalidWords = ref(new Set<number>())

const modalTitle = computed(() => {
  switch (modalType.value) {
    case 'reset': return 'Reset Board'
    case 'newGame': return 'Start New Game'
    case 'wordReview': return 'Word Review'
    case 'error': return 'Notice'
    default: return ''
  }
})

watch(modalType, () => {
  invalidWords.value.clear()
})

function close() {
  uiStore.hideModal()
}

function handleBackdropClick() {
  close()
}

function handleReset() {
  // Move all board tiles back to bench
  const boardTiles = boardStore.getAllTiles()
  boardTiles.forEach(({ tile }) => {
    playerStore.markTileOnBoard(tile.id, false)
  })
  boardStore.clearBoard()
  socketStore.resetBoard(gameStore.gameId)
  close()
}

function handleNewGame() {
  gameStore.reset()
  playerStore.reset()
  boardStore.clearBoard()
  router.push({ name: 'landing' })
}

function toggleWord(index: number) {
  if (invalidWords.value.has(index)) {
    invalidWords.value.delete(index)
  } else {
    invalidWords.value.add(index)
  }
}

function submitReview() {
  const validWords = modalData.value?.words.filter((_: string, index: number) => !invalidWords.value.has(index)) || []
  socketStore.validateWords(gameStore.gameId, modalData.value?.playerId, validWords)
  close()
}
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  font-size: 1.25rem;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.words-review {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
  max-height: 300px;
  overflow-y: auto;
}

.word-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.word {
  font-weight: 500;
  text-transform: uppercase;
}

.word-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  cursor: pointer;
  font-weight: bold;
  
  &.invalid {
    background-color: #dc3545;
  }
  
  &:hover {
    opacity: 0.8;
  }
}

// Transitions
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
  
  .modal-content {
    transition: transform 0.3s;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  
  .modal-content {
    transform: scale(0.9);
  }
}
</style>