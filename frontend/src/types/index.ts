export interface Tile {
  letter: string
  id: string
}

export interface Player {
  id: string
  name: string
  ready: boolean
  tiles?: Tile[]
  tile_count?: number
}

export interface GameState {
  id: string
  players: Record<string, string[]> // Backend format: player_id -> tiles array
  state: 'IDLE' | 'ACTIVE' | 'ENDGAME' | 'OVER'
  num_players?: number
  tiles_remaining?: number
  winning_player?: string
  winning_words?: string[]
}

export interface BoardCell {
  row: number
  col: number
  tile?: Tile
}

export interface Position {
  row: number
  col: number
}

export interface DragData {
  tileId: string
  sourceRow?: number
  sourceCol?: number
  sourceBench?: boolean
}