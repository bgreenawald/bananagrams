import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tile } from '@/types'
import { useGameStore } from './game'
import { logger } from '@/utils/logger'

export const usePlayerStore = defineStore('player', () => {
  const playerName = ref<string>('')
  const playerId = ref<string>('')
  const tiles = ref<Tile[]>([])
  const selectedTiles = ref<Set<string>>(new Set())

  const gameStore = useGameStore()

  const currentPlayer = computed(() => {
    return gameStore.players.find(p => p.name === playerName.value)
  })

  const tileCount = computed(() => currentPlayer.value?.tile_count || tiles.value.length)

  function setPlayerName(name: string) {
    playerName.value = name
  }

  function setPlayerId(id: string) {
    playerId.value = id
  }

  function setTiles(newTiles: Tile[]) {
    logger.tileUpdate(`Setting ${newTiles.length} tiles (was ${tiles.value.length})`, {
      newCount: newTiles.length,
      oldCount: tiles.value.length,
    })
    tiles.value = newTiles
  }

  function addTile(tile: Tile) {
    tiles.value.push(tile)
  }

  function removeTile(tileId: string) {
    tiles.value = tiles.value.filter(t => t.id !== tileId)
  }

  function markTileOnBoard(tileId: string, onBoard: boolean = true) {
    const tile = tiles.value.find(t => t.id === tileId)
    if (tile) {
      tile.onBoard = onBoard
    }
  }

  function updateTiles(newTiles: Tile[]) {
    const existingIds = new Set(tiles.value.map(t => t.id))
    const newTilesToAdd = newTiles.filter(t => !existingIds.has(t.id))

    logger.tileUpdate(`Updating tiles: adding ${newTilesToAdd.length} new tiles`, {
      receivedTiles: newTiles.length,
      currentTiles: tiles.value.length,
      newTiles: newTilesToAdd.length,
      finalCount: tiles.value.length + newTilesToAdd.length,
    })

    tiles.value = [...tiles.value, ...newTilesToAdd]
  }

  function selectTile(tileId: string) {
    selectedTiles.value.add(tileId)
  }

  function deselectTile(tileId: string) {
    selectedTiles.value.delete(tileId)
  }

  function toggleTileSelection(tileId: string) {
    if (selectedTiles.value.has(tileId)) {
      deselectTile(tileId)
    } else {
      selectTile(tileId)
    }
  }

  function clearSelection() {
    selectedTiles.value.clear()
  }

  function selectAll() {
    tiles.value.forEach(tile => selectedTiles.value.add(tile.id))
  }

  function isSelected(tileId: string) {
    return selectedTiles.value.has(tileId)
  }

  function reset() {
    playerName.value = ''
    playerId.value = ''
    tiles.value = []
    selectedTiles.value.clear()
  }

  // Computed property for bench tiles (tiles not on board)
  const benchTiles = computed(() => tiles.value.filter(t => !t.onBoard))

  return {
    playerName,
    playerId,
    tiles,
    benchTiles,
    selectedTiles,
    currentPlayer,
    tileCount,
    setPlayerName,
    setPlayerId,
    setTiles,
    addTile,
    removeTile,
    markTileOnBoard,
    updateTiles,
    selectTile,
    deselectTile,
    toggleTileSelection,
    clearSelection,
    selectAll,
    isSelected,
    reset,
  }
})
