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
    tiles.value = newTiles
  }

  function addTile(tile: Tile) {
    tiles.value.push(tile)
  }

  function removeTile(tileId: string) {
    tiles.value = tiles.value.filter(t => t.id !== tileId)
  }

  function updateTiles(newTiles: Tile[]) {
    const existingIds = new Set(tiles.value.map(t => t.id))
    const newTilesToAdd = newTiles.filter(t => !existingIds.has(t.id))
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

  return {
    playerName,
    playerId,
    tiles,
    selectedTiles,
    currentPlayer,
    tileCount,
    setPlayerName,
    setPlayerId,
    setTiles,
    addTile,
    removeTile,
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