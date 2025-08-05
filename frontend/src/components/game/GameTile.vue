<template>
  <div
    class="game-tile"
    :class="{
      'selected': isSelected,
      'dragging': isDragging
    }"
    :draggable="true"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <span class="tile-letter">{{ tile.letter }}</span>
    <button
      v-if="showSwapButton"
      @click.stop="handleSwap"
      class="swap-button"
    >
      ↻
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Tile } from '@/types'
import { usePlayerStore } from '@/stores/player'
import { useUIStore } from '@/stores/ui'
import { useGameStore } from '@/stores/game'
import { useSocketStore } from '@/stores/socket'

const props = defineProps<{
  tile: Tile
  sourceRow?: number
  sourceCol?: number
  sourceBench?: boolean
}>()

const playerStore = usePlayerStore()
const uiStore = useUIStore()
const gameStore = useGameStore()
const socketStore = useSocketStore()

const showSwapButton = ref(false)
const isDragging = ref(false)

const isSelected = computed(() => playerStore.isSelected(props.tile.id))

function handleClick() {
  playerStore.toggleTileSelection(props.tile.id)
  showSwapButton.value = false
}

function handleDoubleClick() {
  showSwapButton.value = !showSwapButton.value
}

function handleDragStart(e: DragEvent) {
  isDragging.value = true
  uiStore.setIsDragging(true)

  uiStore.setDragData({
    tileId: props.tile.id,
    sourceRow: props.sourceRow,
    sourceCol: props.sourceCol,
    sourceBench: props.sourceBench
  })

  // Set drag data
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', props.tile.id)

    // Create custom drag image
    const target = e.target as HTMLElement
    if (target) {
      const dragImage = target.cloneNode(true) as HTMLElement
      dragImage.style.opacity = '0.8'
      document.body.appendChild(dragImage)
      e.dataTransfer.setDragImage(dragImage, 25, 25)
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage)
        }
      }, 0)
    }
  }
}

function handleDragEnd() {
  isDragging.value = false
  uiStore.setIsDragging(false)
  uiStore.setDragData(null)
}

function handleSwap() {
  socketStore.swapTile(gameStore.gameId, props.tile.letter)
  showSwapButton.value = false
}
</script>

<style scoped lang="scss">
.game-tile {
  width: 48px;
  height: 48px;
  background-color: #fff3cd;
  border: 2px solid #856404;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: move;
  user-select: none;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &.selected {
    background-color: #d4edda;
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.3);
  }

  &.dragging {
    opacity: 0.5;
  }
}

.tile-letter {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-transform: uppercase;
}

.swap-button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #0056b3;
  }
}
</style>
