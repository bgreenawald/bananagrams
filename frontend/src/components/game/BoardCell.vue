<template>
  <div
    class="board-cell"
    :class="{
      'has-tile': hasTile,
      'drag-over': isDragOver
    }"
    :data-row="row"
    :data-col="col"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <GameTile
      v-if="tile"
      :tile="tile"
      :source-row="row"
      :source-col="col"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import GameTile from './GameTile.vue'
import { useBoardStore } from '@/stores/board'
import { useUIStore } from '@/stores/ui'
import { useDragDrop } from '@/composables/useDragDrop'

const props = defineProps<{
  row: number
  col: number
}>()

const boardStore = useBoardStore()
const uiStore = useUIStore()
const { handleCellDrop } = useDragDrop()

const isDragOver = ref(false)

const tile = computed(() => boardStore.getTileAt(props.row, props.col))
const hasTile = computed(() => !!tile.value)

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  if (uiStore.isDragging) {
    isDragOver.value = true
  }
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (uiStore.isDragging && e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false

  if (!uiStore.dragData) return

  handleCellDrop(props.row, props.col)
}
</script>

<style scoped lang="scss">
.board-cell {
  width: 50px;
  height: 50px;
  border: 1px solid #ddd;
  background-color: white;
  position: relative;
  transition: all 0.2s;

  &.has-tile {
    background-color: #f9f9f9;
  }

  &.drag-over {
    background-color: #e8f5e9;
    border-color: #4CAF50;
    box-shadow: inset 0 0 0 2px #4CAF50;

    &.has-tile {
      background-color: #fff3e0;
      border-color: #ff9800;
      box-shadow: inset 0 0 0 2px #ff9800;
    }
  }
}
</style>
