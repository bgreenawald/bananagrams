import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

import * as UserActions from '../actions/user.actions';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { AppState } from '../reducers';
import * as Selectors from '../selectors';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private store = inject(Store<AppState>);
  private apiService = inject(ApiService);
  private socketService = inject(SocketService);

  // Call Bananagrams effect
  callBananagrams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.callBananagrams),
      withLatestFrom(this.store.select(Selectors.getPlayerIDSelector)),
      tap(([action, playerID]) => {
        if (playerID) {
          this.socketService.userCallBananagrams(action.gameID, playerID, action.words);
        }
      })
    ),
    { dispatch: false }
  );

  // Reset game effect
  resetGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.resetGame),
      tap(({ gameID }) => {
        this.socketService.startGame(gameID);
      })
    ),
    { dispatch: false }
  );

  // Swap tiles effect
  swapTiles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.swapTiles),
      withLatestFrom(
        this.store.select(Selectors.getPlayerIDSelector),
        this.store.select(Selectors.getPlayerTiles),
        this.store.select(Selectors.selectGameID)
      ),
      tap(([action, playerID, tiles, gameID]) => {
        if (playerID && gameID) {
          this.socketService.swapTiles(gameID, action.letter, playerID);
        }
      })
    ),
    { dispatch: false }
  );
}