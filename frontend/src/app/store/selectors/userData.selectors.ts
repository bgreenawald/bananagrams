import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from '../reducers/user.reducer';

// Feature selector for user state
export const selectUserState = createFeatureSelector<UserState>('user');

// User data selectors
export const selectUserPlayerID = createSelector(
  selectUserState,
  (state: UserState) => state.playerID
);

export const selectUserTiles = createSelector(
  selectUserState,
  (state: UserState) => state.tiles
);

export const selectCurrentView = createSelector(
  selectUserState,
  (state: UserState) => state.currentView
);

// Legacy selector for backward compatibility
export const getUserState = selectUserState;