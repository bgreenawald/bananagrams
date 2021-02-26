import { Injectable } from '@angular/core';
import * as GameActions from '../actions/game.actions';
import * as endpointServices from '../../services/api.service';
import * as SocketServices from '../../services/socket.service';

import { Effect, Actions, ofType, createEffect } from '@ngrx/effects';
import { switchMap, map, catchError, mergeMap, mapTo, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs';

import { SocketSuccessResponses } from './../../constants';


@Injectable()
export class GameEffects {
    constructor(
        private actions$: Actions<GameActions.GameActionTypes>,
        private endpointService: endpointServices.ApiService,
        private socketService: SocketServices.SocketService
    ) { }

    playerJoin$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.SET_PLAYER_ID),
        )).subscribe(action =>
            this.socketService.playerJoin(action.gameID, action.playerName)
        )

    loadUnavailableGameIDs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.LOAD_RESERVED_GAME_IDS),
            mergeMap(() => this.endpointService.getIDs()
                .pipe(
                    map(gameIDs => (new GameActions.SetReservedGameIDs(gameIDs))),
                    catchError(err => throwError(err))
                )
            )
        )
    )

    enterRoom$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.OPEN_SOCKET),
            map(action => {
                this.socketService.connectToSocket(action.gameID)
                return new GameActions.LoadGameSuccess()
            }
            )
        )
    )

    loadOrCreateGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.LOAD_OR_CREATE_GAME),
        )).subscribe(action =>
            this.socketService.loadOrCreateGame(action.gameID)
        )

    openSocket$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.OPEN_SOCKET)
        )
            .pipe(
                switchMap(action => {
                    return this.socketService.receive().pipe(
                        map(response => {
                            if (response.status_code !== 200) {
                                console.log('error from socket server', response)
                                throw `error: ${response.message}`
                            }

                            switch (response.message) {
                                case (SocketSuccessResponses.GameLoaded):
                                    new GameActions.UpdateSocketData(response.message, JSON.parse(response.payload));
                            }
                        }
                        ),
                        catchError(errorMessage => throwError(errorMessage))
                    )
                })
            )
    )
}