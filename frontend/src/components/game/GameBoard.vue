<template>
  <div class="board-container" ref="boardContainer">
    <div class="board-scroll" ref="boardScroll">
      <div class="game-board">
        <div v-for="row in BOARD_SIZE" :key="`row-${row}`" class="board-row">
          <BoardCell
            v-for="col in BOARD_SIZE"
            :key="`cell-${row}-${col}`"
            :row="row - 1"
            :col="col - 1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import BoardCell from './BoardCell.vue'
import { useBoardStore } from '@/stores/board'
import { usePlayerStore } from '@/stores/player'
import { useUIStore } from '@/stores/ui'

const BOARD_SIZE = 40
const CELL_SIZE = 50 // pixels

const boardContainer = ref<HTMLElement>()
const boardScroll = ref<HTMLElement>()

const boardStore = useBoardStore()
const playerStore = usePlayerStore()
const uiStore = useUIStore()

onMounted(async () => {
  await nextTick()
  centerBoard()
  window.addEventListener('keydown', handleArrowKeys)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleArrowKeys)
})

function centerBoard() {
  if (!boardScroll.value) return

  const containerWidth = boardScroll.value.clientWidth
  const containerHeight = boardScroll.value.clientHeight
  const boardWidth = BOARD_SIZE * CELL_SIZE
  const boardHeight = BOARD_SIZE * CELL_SIZE

  boardScroll.value.scrollLeft = (boardWidth - containerWidth) / 2
  boardScroll.value.scrollTop = (boardHeight - containerHeight) / 2
}

function handleArrowKeys(event: KeyboardEvent) {
  // Ignore if user is typing in an input field or if modal is shown
  if (event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      uiStore.modalType !== null) {
    return
  }

  // Only handle arrow keys
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    return
  }

  // Get selected tiles
  const selectedTileIds = Array.from(playerStore.selectedTiles)
  if (selectedTileIds.length === 0) {
    return
  }

  event.preventDefault()

  // Calculate movement offset based on arrow key
  let rowOffset = 0
  let colOffset = 0

  switch (event.key) {
    case 'ArrowUp':
      rowOffset = -1
      break
    case 'ArrowDown':
      rowOffset = 1
      break
    case 'ArrowLeft':
      colOffset = -1
      break
    case 'ArrowRight':
      colOffset = 1
      break
  }

  // Get positions of all selected tiles on the board
  const selectedTilesOnBoard: Array<{ tile: any; row: number; col: number }> = []

  for (const tileId of selectedTileIds) {
    // Find tile position on board
    const allBoardTiles = boardStore.getAllTiles()
    const tileData = allBoardTiles.find(({ tile }) => tile.id === tileId)

    if (tileData) {
      selectedTilesOnBoard.push({
        tile: tileData.tile,
        row: tileData.position.row,
        col: tileData.position.col
      })
    }
  }

  // If no selected tiles are on the board, nothing to move
  if (selectedTilesOnBoard.length === 0) {
    return
  }

  // Check if all tiles can move to their new positions
  const canMove = selectedTilesOnBoard.every(({ row, col }) => {
    const newRow = row + rowOffset
    const newCol = col + colOffset

    // Check bounds
    if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
      return false
    }

    // Check if destination is empty or occupied by another selected tile
    const destTile = boardStore.getTileAt(newRow, newCol)
    if (destTile && !selectedTileIds.includes(destTile.id)) {
      return false
    }

    return true
  })

  if (!canMove) {
    return
  }

  // Sort tiles to avoid collision during movement
  // When moving right or down, process tiles in reverse order
  const sortedTiles = [...selectedTilesOnBoard].sort((a, b) => {
    if (rowOffset > 0) return b.row - a.row // Moving down: process bottom tiles first
    if (rowOffset < 0) return a.row - b.row // Moving up: process top tiles first
    if (colOffset > 0) return b.col - a.col // Moving right: process right tiles first
    if (colOffset < 0) return a.col - b.col // Moving left: process left tiles first
    return 0
  })

  // Move all selected tiles
  for (const { row, col } of sortedTiles) {
    const newRow = row + rowOffset
    const newCol = col + colOffset
    boardStore.moveTile(row, col, newRow, newCol)
  }
}
</script>

<style scoped lang="scss">
.board-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #e0e0e0;
}

.board-scroll {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

.game-board {
  display: inline-block;
  background-color: #f5f5f5;
  border: 2px solid #ccc;
  margin: 20px;
}

.board-row {
  display: flex;
  height: 50px;
}
</style>
