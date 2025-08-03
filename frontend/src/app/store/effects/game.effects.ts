import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, mergeMap, exhaustMap, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

import * as GameActions from '../actions/game.actions';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Injectable()
export class GameEffects {
  private actions$ = inject(Actions);
  private apiService = inject(ApiService);
  private socketService = inject(SocketService);

  // Player join effect
  playerJoin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.setPlayerId),
      tap(({ gameID, playerName }) => {
        this.socketService.playerJoin(gameID, playerName);
      })
    ),
    { dispatch: false }
  );

  // Load unavailable game IDs
  loadUnavailableGameIDs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.loadReservedGameIds),
      mergeMap(() =>
        this.apiService.getIDs().pipe(
          map(gameIDs => GameActions.setReservedGameIds({ gameIDs })),
          catchError(err => {
            console.error('Error loading reserved game IDs:', err);
            return throwError(() => err);
          })
        )
      )
    )
  );

  // Join room effect
  joinRoom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.joinRoom),
      map(({ gameID }) => {
        this.socketService.joinRoom(gameID);
        return GameActions.successJoinRoom();
      })
    )
  );

  // Load or create game effect
  loadOrCreateGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.loadOrCreateGame),
      map(({ gameID }) => {
        this.socketService.loadOrCreateGame(gameID);
        return GameActions.loadGameSuccess();
      })
    )
  );

  // Socket connection and message handling
  openSocket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.openSocket),
      switchMap(() =>
        this.socketService.receive().pipe(
          map(response => {
            console.log('SOCKET RESPONSE FROM EFFECTS', response);
            
            if (response.status_code !== 200) {
              return GameActions.failOpenSocket({
                error: response.message,
                response: JSON.parse(response.payload)
              });
            }

            // Handle different socket response types
            switch (response.message) {
              case 'Game loaded.': // SocketSuccessResponses.GameLoaded
                return GameActions.updateSocketData({
                  message: response.message,
                  payload: JSON.parse(response.payload)
                });
              default:
                return GameActions.updateSocketData({
                  message: response.message,
                  payload: JSON.parse(response.payload)
                });
            }
          }),
          catchError(errorMessage => {
            console.error('Socket error:', errorMessage);
            return of(GameActions.failOpenSocket({
              error: 'Socket connection failed',
              response: errorMessage
            }));
          })
        )
      )
    )
  );

  // Start game effect
  startGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.startGame),
      tap(({ gameID }) => {
        this.socketService.startGame(gameID);
      })
    ),
    { dispatch: false }
  );
}