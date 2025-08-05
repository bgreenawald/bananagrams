import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useBoardStore } from '@/stores/board'
import { useUIStore } from '@/stores/ui'
import { useSocketStore } from '@/stores/socket'
import { logger } from '@/utils/logger'
import type { Tile } from '@/types'

export function useDragDrop() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const boardStore = useBoardStore()
  const uiStore = useUIStore()
  const socketStore = useSocketStore()

  // Validation helper to ensure tile state consistency
  function validateTileOperation(tileId: string, operation: string): boolean {
    const tile = findTileById(tileId)
    if (!tile) {
      logger.error(`${operation}: Tile ${tileId} not found`, 'Drag Drop')
      return false
    }
    return true
  }

  function handleCellDrop(targetRow: number, targetCol: number) {
    const dragData = uiStore.dragData
    if (!dragData) return

    if (!validateTileOperation(dragData.tileId, 'Cell Drop')) return
    const draggedTile = findTileById(dragData.tileId)
    if (!draggedTile) return

    // Get all selected tiles or just the dragged tile
    const tilesToMove = playerStore.selectedTiles.size > 0 && playerStore.isSelected(dragData.tileId)
      ? Array.from(playerStore.selectedTiles).map(id => findTileById(id)).filter(Boolean) as Tile[]
      : [draggedTile]

    // Calculate offset for multi-tile move
    let rowOffset = 0
    let colOffset = 0

    if (dragData.sourceRow !== undefined && dragData.sourceCol !== undefined) {
      rowOffset = targetRow - dragData.sourceRow
      colOffset = targetCol - dragData.sourceCol
    }

    // Check if all target positions are valid
    const moves: Array<{ tile: Tile, fromRow?: number, fromCol?: number, toRow: number, toCol: number }> = []

    for (const tile of tilesToMove) {
      const tilePos = findTilePosition(tile.id)

      if (tilePos) {
        const newRow = tilePos.row + rowOffset
        const newCol = tilePos.col + colOffset

        // Check bounds and availability
        if (newRow < 0 || newRow >= boardStore.boardSize ||
            newCol < 0 || newCol >= boardStore.boardSize) {
          return // Cancel if any tile would go out of bounds
        }

        const targetTile = boardStore.getTileAt(newRow, newCol)
        if (targetTile && targetTile.id !== tile.id) {
          return // Cancel if any target cell is occupied by another tile
        }

        moves.push({
          tile,
          fromRow: tilePos.row,
          fromCol: tilePos.col,
          toRow: newRow,
          toCol: newCol
        })
      } else if (dragData.sourceBench) {
        // Moving from bench - only allow single tile
        if (tilesToMove.length > 1) return

        moves.push({
          tile,
          toRow: targetRow,
          toCol: targetCol
        })
      }
    }

    // Execute all moves with validation
    for (const move of moves) {
      try {
        if (move.fromRow !== undefined && move.fromCol !== undefined) {
          // Move from board to board
          const success = boardStore.moveTile(move.fromRow, move.fromCol, move.toRow, move.toCol)
          if (success) {
            socketStore.moveTile(gameStore.gameId, move.fromRow, move.fromCol, move.toRow, move.toCol)
          } else {
            logger.error(
              `Failed to move tile from (${move.fromRow}, ${move.fromCol}) to (${move.toRow}, ${move.toCol})`,
              'Drag Drop',
              { tile: move.tile, fromRow: move.fromRow, fromCol: move.fromCol, toRow: move.toRow, toCol: move.toCol }
            )
          }
        } else {
          // Move from bench to board
          // Check if target cell is actually empty
          if (boardStore.getTileAt(move.toRow, move.toCol)) {
            logger.error(
              `Target cell (${move.toRow}, ${move.toCol}) is occupied`,
              'Drag Drop',
              { targetRow: move.toRow, targetCol: move.toCol }
            )
            continue
          }

          playerStore.markTileOnBoard(move.tile.id, true)
          boardStore.placeTile(move.tile, move.toRow, move.toCol)
          socketStore.placeTile(gameStore.gameId, move.tile.id, move.toRow, move.toCol)
        }
      } catch (error) {
        logger.error(
          `Error executing move for tile ${move.tile.id}`,
          'Drag Drop',
          { error, tile: move.tile, move }
        )
      }
    }

    playerStore.clearSelection()
  }

  function handleBenchDrop() {
    const dragData = uiStore.dragData
    if (!dragData || dragData.sourceBench) return

    const draggedTile = findTileById(dragData.tileId)
    if (!draggedTile) return

    if (dragData.sourceRow !== undefined && dragData.sourceCol !== undefined) {
      // Move from board to bench
      const tile = boardStore.removeTile(dragData.sourceRow, dragData.sourceCol)
      if (tile) {
        playerStore.markTileOnBoard(tile.id, false)
        // TODO: Send socket event for removing tile from board
      }
    }

    playerStore.clearSelection()
  }

  function findTileById(tileId: string): Tile | null {
    // Check player tiles
    const playerTile = playerStore.tiles.find(t => t.id === tileId)
    if (playerTile) return playerTile

    // Check board tiles
    const boardTiles = boardStore.getAllTiles()
    const boardTile = boardTiles.find(item => item.tile.id === tileId)
    if (boardTile) return boardTile.tile

    return null
  }

  function findTilePosition(tileId: string): { row: number, col: number } | null {
    const boardTiles = boardStore.getAllTiles()
    const found = boardTiles.find(item => item.tile.id === tileId)
    return found ? found.position : null
  }

  return {
    handleCellDrop,
    handleBenchDrop
  }
}
