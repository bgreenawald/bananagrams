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

    // Only allow multi-tile drag from board positions
    if (tilesToMove.length > 1 && dragData.sourceBench) {
      // Can't drag multiple tiles from bench
      return
    }

    // Calculate offset for multi-tile move
    let rowOffset = 0
    let colOffset = 0

    if (dragData.sourceRow !== undefined && dragData.sourceCol !== undefined) {
      rowOffset = targetRow - dragData.sourceRow
      colOffset = targetCol - dragData.sourceCol
    }

    // Check if all target positions are valid
    const moves: Array<{ tile: Tile, fromRow?: number, fromCol?: number, toRow: number, toCol: number }> = []

    // First, collect all moves and their target positions
    const targetPositions = new Map<string, string>() // targetKey -> tileId

    for (const tile of tilesToMove) {
      const tilePos = findTilePosition(tile.id)

      if (tilePos) {
        const newRow = tilePos.row + rowOffset
        const newCol = tilePos.col + colOffset

        // Check bounds
        if (newRow < 0 || newRow >= boardStore.boardSize ||
            newCol < 0 || newCol >= boardStore.boardSize) {
          return // Cancel if any tile would go out of bounds
        }

        const targetKey = `${newRow},${newCol}`

        // Check if another tile being moved wants the same target position
        if (targetPositions.has(targetKey)) {
          return // Two tiles want the same position
        }

        targetPositions.set(targetKey, tile.id)

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

    // Now check if any target position is blocked by a non-moving tile
    for (const move of moves) {
      const targetTile = boardStore.getTileAt(move.toRow, move.toCol)
      if (targetTile) {
        // Check if this tile is one of the tiles being moved
        const isMovingTile = tilesToMove.some(t => t.id === targetTile.id)
        if (!isMovingTile) {
          return // Blocked by a tile that's not moving
        }
      }
    }

    // Execute all moves - remove all tiles first, then place them
    // This ensures tiles don't block each other during multi-tile moves
    const boardMoves = moves.filter(m => m.fromRow !== undefined && m.fromCol !== undefined)
    const benchMoves = moves.filter(m => m.fromRow === undefined || m.fromCol === undefined)

    // Step 1: Remove all tiles from their current positions
    const removedTiles: Array<{ tile: Tile, move: typeof moves[0] }> = []
    for (const move of boardMoves) {
      const tile = boardStore.removeTile(move.fromRow!, move.fromCol!)
      if (tile) {
        removedTiles.push({ tile, move })
      }
    }

    // Step 2: Place all tiles in their new positions
    try {
      for (const { tile, move } of removedTiles) {
        boardStore.placeTile(tile, move.toRow, move.toCol)
        socketStore.moveTile(gameStore.gameId, move.fromRow!, move.fromCol!, move.toRow, move.toCol)
      }
    } catch (error) {
      // Rollback on error - place tiles back in original positions
      logger.error('Failed to complete multi-tile move, rolling back', 'Drag Drop', { error })
      for (const { tile, move } of removedTiles) {
        boardStore.placeTile(tile, move.fromRow!, move.fromCol!)
      }
      return
    }

    // Handle bench to board moves (these don't conflict)
    for (const move of benchMoves) {
      try {
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
