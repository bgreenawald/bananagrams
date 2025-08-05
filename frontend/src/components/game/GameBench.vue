<template>
  <div class="bench-container">
    <h3 class="bench-title">Your Tiles ({{ tiles.length }})</h3>
    <div class="bench-tiles">
      <div
        v-for="tile in tiles"
        :key="tile.id"
        class="bench-slot"
        @dragover="handleDragOver"
        @drop="handleDrop"
      >
        <GameTile
          :tile="tile"
          :source-bench="true"
        />
      </div>
      <div
        v-for="empty in emptySlots"
        :key="`empty-${empty}`"
        class="bench-slot empty"
        @dragover="handleDragOver"
        @drop="handleDrop"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameTile from './GameTile.vue'
import { usePlayerStore } from '@/stores/player'
import { useDragDrop } from '@/composables/useDragDrop'
import { logger } from '@/utils/logger'

const playerStore = usePlayerStore()
const { handleBenchDrop } = useDragDrop()

const tiles = computed(() => {
  logger.tileUpdate(
    `Bench tiles computed: ${playerStore.benchTiles.length} tiles`,
    {
      totalTiles: playerStore.tiles.length,
      benchTiles: playerStore.benchTiles.length,
      tileLetters: playerStore.benchTiles.map(t => t.letter)
    }
  )
  return playerStore.benchTiles
})
const minSlots = 20

const emptySlots = computed(() => {
  const currentCount = tiles.value.length
  return currentCount < minSlots ? minSlots - currentCount : 0
})

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  handleBenchDrop()
}
</script>

<style scoped lang="scss">
.bench-container {
  background-color: #f8f9fa;
  border-top: 2px solid #dee2e6;
  padding: 1rem;
  min-height: 120px;
}

.bench-title {
  font-size: 1.1rem;
  color: #495057;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.bench-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 60px;
}

.bench-slot {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &.empty {
    border: 2px dashed #dee2e6;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.02);
  }
}
</style>
