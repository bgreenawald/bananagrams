export interface Tile {
  letter: string;
  id: string;
}

export interface Player {
  id: string;
  name: string;
  ready: boolean;
  tiles?: Tile[];
}

export interface GameState {
  id: string;
  players: Player[];
  state: string;
  tilesRemaining?: number;
  winner?: string;
}

export interface BoardCell {
  row: number;
  col: number;
  tile?: Tile;
}