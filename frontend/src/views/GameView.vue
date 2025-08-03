<template>
  <div class="game-container">
    <GameControls />
    <div class="game-content">
      <GameBoard />
      <GameBench />
    </div>
    <GameModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import GameBoard from '@/components/game/GameBoard.vue'
import GameBench from '@/components/game/GameBench.vue'
import GameControls from '@/components/game/GameControls.vue'
import GameModal from '@/components/common/GameModal.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const gameId = route.params.id as string

onMounted(() => {
  gameStore.setGameId(gameId)
  
  // Warn before leaving page
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

watch(() => gameStore.gameState?.state, (newState) => {
  if (newState === 'OVER') {
    router.push({ name: 'gameover', params: { id: gameId } })
  } else if (newState === 'IDLE') {
    router.push({ name: 'lobby', params: { id: gameId } })
  }
})

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (gameStore.isActive) {
    e.preventDefault()
    e.returnValue = ''
  }
}
</script>

<style scoped lang="scss">
.game-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.game-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>