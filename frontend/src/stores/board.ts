import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tile, Position } from '@/types'

interface BoardState {
  [key: string]: Tile
}

export const useBoardStore = defineStore('board', () => {
  const board = ref<BoardState>({})
  const boardSize = 40

  function getCellKey(row: number, col: number): string {
    return `${row},${col}`
  }

  function getTileAt(row: number, col: number): Tile | null {
    return board.value[getCellKey(row, col)] || null
  }

  function placeTile(tile: Tile, row: number, col: number) {
    board.value[getCellKey(row, col)] = tile
  }

  function removeTile(row: number, col: number): Tile | null {
    const key = getCellKey(row, col)
    const tile = board.value[key]
    if (tile) {
      delete board.value[key]
    }
    return tile
  }

  function moveTile(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const tile = getTileAt(fromRow, fromCol)
    if (!tile || getTileAt(toRow, toCol)) {
      return false
    }
    
    removeTile(fromRow, fromCol)
    placeTile(tile, toRow, toCol)
    return true
  }

  function isCellEmpty(row: number, col: number): boolean {
    return !getTileAt(row, col)
  }

  function getOccupiedCells(): Position[] {
    return Object.keys(board.value).map(key => {
      const [row, col] = key.split(',').map(Number)
      return { row, col }
    })
  }

  function getAllTiles(): { tile: Tile; position: Position }[] {
    return Object.entries(board.value).map(([key, tile]) => {
      const [row, col] = key.split(',').map(Number)
      return { tile, position: { row, col } }
    })
  }

  function clearBoard() {
    board.value = {}
  }

  function getBoardBounds(): { minRow: number; maxRow: number; minCol: number; maxCol: number } | null {
    const positions = getOccupiedCells()
    if (positions.length === 0) return null

    let minRow = positions[0].row
    let maxRow = positions[0].row
    let minCol = positions[0].col
    let maxCol = positions[0].col

    positions.forEach(pos => {
      minRow = Math.min(minRow, pos.row)
      maxRow = Math.max(maxRow, pos.row)
      minCol = Math.min(minCol, pos.col)
      maxCol = Math.max(maxCol, pos.col)
    })

    return { minRow, maxRow, minCol, maxCol }
  }

  function isConnected(): boolean {
    const occupied = getOccupiedCells()
    if (occupied.length === 0) return true
    if (occupied.length === 1) return true

    const visited = new Set<string>()
    const queue = [occupied[0]]
    visited.add(getCellKey(occupied[0].row, occupied[0].col))

    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ]

    while (queue.length > 0) {
      const current = queue.shift()!
      
      for (const [dr, dc] of directions) {
        const newRow = current.row + dr
        const newCol = current.col + dc
        const key = getCellKey(newRow, newCol)
        
        if (!visited.has(key) && getTileAt(newRow, newCol)) {
          visited.add(key)
          queue.push({ row: newRow, col: newCol })
        }
      }
    }

    return visited.size === occupied.length
  }

  return {
    board,
    boardSize,
    getTileAt,
    placeTile,
    removeTile,
    moveTile,
    isCellEmpty,
    getOccupiedCells,
    getAllTiles,
    clearBoard,
    getBoardBounds,
    isConnected
  }
})