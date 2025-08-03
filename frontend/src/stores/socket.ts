import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useGameStore } from './game'
import { usePlayerStore } from './player'
import type { GameState, Tile } from '@/types'

export const useSocketStore = defineStore('socket', () => {
  const socket = ref<Socket | null>(null)
  const connected = ref(false)
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()

  function connect() {
    if (socket.value?.connected) return

    socket.value = io('/', {
      transports: ['websocket'],
      upgrade: false
    })

    socket.value.on('connect', () => {
      console.log('Socket connected')
      connected.value = true
    })

    socket.value.on('disconnect', () => {
      console.log('Socket disconnected')
      connected.value = false
    })

    socket.value.on('render_game', (data: { status_code: number, message: string, payload: string }) => {
      console.log('Game rendered:', data)
      if (data.status_code === 200 && data.payload) {
        try {
          const gameData = JSON.parse(data.payload)
          gameStore.updateGameState(gameData)
        } catch (error) {
          console.error('Failed to parse game data:', error)
        }
      } else if (data.status_code === 400) {
        gameStore.setError(data.message)
      }
    })

    socket.value.on('game_state', (data: GameState) => {
      console.log('Game state updated:', data)
      gameStore.updateGameState(data)
    })

    socket.value.on('player_tiles', (data: { tiles: Tile[] }) => {
      console.log('Player tiles received:', data)
      playerStore.setTiles(data.tiles)
    })

    socket.value.on('tile_update', (data: { tiles: Tile[] }) => {
      console.log('Tile update received:', data)
      playerStore.updateTiles(data.tiles)
    })

    socket.value.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message)
      gameStore.setError(data.message)
    })

    socket.value.on('game_over', (data: { winner: string, words: string[] }) => {
      console.log('Game over:', data)
      gameStore.updateGameState({
        state: 'OVER',
        winner: data.winner,
        winningWords: data.words
      })
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  function joinGame(gameId: string, playerName: string) {
    if (!socket.value?.connected) {
      console.error('Socket not connected')
      return
    }

    // First join the room
    socket.value.emit('join', {
      name: gameId
    })

    // Then load/create the game
    socket.value.emit('load_game', {
      name: gameId
    })

    // Finally add the player to the game
    socket.value.emit('player_join', {
      name: gameId,
      player_id: playerName
    })
  }

  function startGame(gameId: string) {
    if (!socket.value?.connected) return

    socket.value.emit('start_game', {
      name: gameId
    })
  }

  function placeTile(gameId: string, tileId: string, row: number, col: number) {
    if (!socket.value?.connected) return

    socket.value.emit('place_tile', {
      game_id: gameId,
      tile_id: tileId,
      row,
      col
    })
  }

  function moveTile(gameId: string, fromRow: number, fromCol: number, toRow: number, toCol: number) {
    if (!socket.value?.connected) return

    socket.value.emit('move_tile', {
      game_id: gameId,
      from_row: fromRow,
      from_col: fromCol,
      to_row: toRow,
      to_col: toCol
    })
  }

  function swapTile(gameId: string, tileId: string) {
    if (!socket.value?.connected) return

    socket.value.emit('swap_tile', {
      game_id: gameId,
      tile_id: tileId
    })
  }

  function peel(gameId: string) {
    if (!socket.value?.connected) return

    socket.value.emit('peel', {
      game_id: gameId
    })
  }

  function callBananagrams(gameId: string) {
    if (!socket.value?.connected) return

    socket.value.emit('bananagrams', {
      game_id: gameId
    })
  }

  function validateWords(gameId: string, playerId: string, validWords: string[]) {
    if (!socket.value?.connected) return

    socket.value.emit('validate_words', {
      game_id: gameId,
      player_id: playerId,
      valid_words: validWords
    })
  }

  function resetBoard(gameId: string) {
    if (!socket.value?.connected) return

    socket.value.emit('reset_board', {
      game_id: gameId
    })
  }

  return {
    socket,
    connected,
    connect,
    disconnect,
    joinGame,
    startGame,
    placeTile,
    moveTile,
    swapTile,
    peel,
    callBananagrams,
    validateWords,
    resetBoard
  }
})