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
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { getRouteParam } from '@/utils/route'
import GameBoard from '@/components/game/GameBoard.vue'
import GameBench from '@/components/game/GameBench.vue'
import GameControls from '@/components/game/GameControls.vue'
import GameModal from '@/components/common/GameModal.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const gameId = getRouteParam(route, 'id')
const beforeUnloadHandler = ref<((e: BeforeUnloadEvent) => void) | null>(null)

onMounted(() => {
  if (!gameId) {
    router.push({ name: 'landing' })
    return
  }

  gameStore.setGameId(gameId)

  // Create and store the event handler reference
  beforeUnloadHandler.value = handleBeforeUnload
  window.addEventListener('beforeunload', beforeUnloadHandler.value)
})

onUnmounted(() => {
  removeBeforeUnloadListener()
})

// Also remove listener when leaving route (covers route changes)
onBeforeRouteLeave(() => {
  removeBeforeUnloadListener()
  return true
})

watch(
  () => gameStore.gameState?.state,
  newState => {
    if (newState === 'OVER') {
      router.push({ name: 'gameover', params: { id: gameId } })
    } else if (newState === 'IDLE') {
      router.push({ name: 'lobby', params: { id: gameId } })
    }
  }
)

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (gameStore.isActive) {
    e.preventDefault()
    e.returnValue = ''
  }
}

function removeBeforeUnloadListener() {
  if (beforeUnloadHandler.value) {
    window.removeEventListener('beforeunload', beforeUnloadHandler.value)
    beforeUnloadHandler.value = null
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
