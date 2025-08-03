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
import { ref, onMounted, nextTick } from 'vue'
import BoardCell from './BoardCell.vue'

const BOARD_SIZE = 40
const CELL_SIZE = 50 // pixels

const boardContainer = ref<HTMLElement>()
const boardScroll = ref<HTMLElement>()

onMounted(async () => {
  await nextTick()
  centerBoard()
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