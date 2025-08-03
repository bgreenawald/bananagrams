import { ActionReducerMap } from '@ngrx/store';
import { routerReducer } from '@ngrx/router-store';
import { gameReducer, StoreGameState } from './game.reducer';
import { userReducer, UserState } from './user.reducer';

// Application state interface
export interface AppState {
  game: StoreGameState;
  user: UserState;
  router: any;
}

// Root reducer map
export const reducers: ActionReducerMap<AppState> = {
  game: gameReducer,
  user: userReducer,
  router: routerReducer
};

// Export individual reducers and state types
export * from './game.reducer';
export * from './user.reducer';
export * from './router.reducer';