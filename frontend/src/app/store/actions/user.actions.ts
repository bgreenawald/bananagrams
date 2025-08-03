import { createAction, props } from '@ngrx/store';
import { Tile } from '../../interfaces';

// User gameplay actions
export const callBananagrams = createAction(
  '[Menu Gameplay] User called Bananagrams',
  props<{ gameID: string; playerID: string; words: string[] }>()
);

export const updatePlayerId = createAction(
  '[Lobby] User submitted player id',
  props<{ playerID: string }>()
);

export const resetGame = createAction(
  '[Game] User reset game',
  props<{ gameID: string }>()
);

export const swapTiles = createAction(
  '[Tile] Swap tiles',
  props<{ letter: string }>()
);

export const updatePeeledTiles = createAction(
  '[App Socket Response] Update tiles received from successful peel response',
  props<{ tiles: any }>()
);