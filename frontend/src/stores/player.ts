import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tile } from '@/types'
import { useGameStore } from './game'

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
    console.log(`[PLAYER STORE] setTiles called with ${newTiles.length} tiles`)
    console.log(`[PLAYER STORE] Old tiles count: ${tiles.value.length}`)
    tiles.value = newTiles
    console.log(`[PLAYER STORE] New tiles count: ${tiles.value.length}`)
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
    console.log(`[PLAYER STORE] updateTiles called with ${newTiles.length} tiles`)
    console.log(`[PLAYER STORE] Current tiles before update: ${tiles.value.length}`)
    const existingIds = new Set(tiles.value.map(t => t.id))
    const newTilesToAdd = newTiles.filter(t => !existingIds.has(t.id))
    console.log(`[PLAYER STORE] Adding ${newTilesToAdd.length} new tiles`)
    tiles.value = [...tiles.value, ...newTilesToAdd]
    console.log(`[PLAYER STORE] Final tiles count: ${tiles.value.length}`)
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
    reset
  }
})