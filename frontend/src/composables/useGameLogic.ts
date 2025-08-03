import { useBoardStore } from '@/stores/board'
import { usePlayerStore } from '@/stores/player'

export function useGameLogic() {
  const boardStore = useBoardStore()
  const playerStore = usePlayerStore()

  function validateBoard() {
    // Check if bench is empty
    if (playerStore.benchTiles.length > 0) {
      return { valid: false, error: 'You must use all tiles from your bench' }
    }

    // Check if board has tiles
    const occupiedCells = boardStore.getOccupiedCells()
    if (occupiedCells.length === 0) {
      return { valid: false, error: 'You must place tiles on the board' }
    }

    // Check if all tiles are connected
    if (!boardStore.isConnected()) {
      return { valid: false, error: 'All tiles must be connected' }
    }

    return { valid: true }
  }

  function extractWords(): string[] {
    const words: string[] = []
    const bounds = boardStore.getBoardBounds()
    if (!bounds) return words

    const { minRow, maxRow, minCol, maxCol } = bounds

    // Extract horizontal words
    for (let row = minRow; row <= maxRow; row++) {
      let currentWord = ''
      for (let col = minCol; col <= maxCol + 1; col++) {
        const tile = boardStore.getTileAt(row, col)
        if (tile) {
          currentWord += tile.letter
        } else {
          if (currentWord.length > 1) {
            words.push(currentWord.toUpperCase())
          }
          currentWord = ''
        }
      }
    }

    // Extract vertical words
    for (let col = minCol; col <= maxCol; col++) {
      let currentWord = ''
      for (let row = minRow; row <= maxRow + 1; row++) {
        const tile = boardStore.getTileAt(row, col)
        if (tile) {
          currentWord += tile.letter
        } else {
          if (currentWord.length > 1) {
            words.push(currentWord.toUpperCase())
          }
          currentWord = ''
        }
      }
    }

    return [...new Set(words)] // Remove duplicates
  }

  return {
    validateBoard,
    extractWords
  }
}