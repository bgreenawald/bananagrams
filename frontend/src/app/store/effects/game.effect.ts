import { Injectable } from '@angular/core';
import * as GameActions from '../actions/game.actions';
import * as endpointServices from '../../services/api.service';
import * as SocketServices from '../../services/socket.service';

import { Effect, Actions, ofType, createEffect } from '@ngrx/effects';
import { switchMap, map, catchError, mergeMap, mapTo, exhaustMap, pluck } from 'rxjs/operators';
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
            ofType(GameActions.SET_PLAYER_ID)
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

    joinRoom$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.JOIN_ROOM),
            pluck('gameID'),
            map(gameID => {
                this.socketService.joinRoom(gameID)
                return new GameActions.SuccessJoinRoom()
            })
        )
    )

    loadOrCreateGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.LOAD_OR_CREATE_GAME),
            pluck('gameID'),
            map(gameID => {
                this.socketService.loadOrCreateGame(gameID)
                return new GameActions.LoadGameSuccess()
            })
        ))

    openSocket$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.OPEN_SOCKET)
        )
            .pipe(
                switchMap(action => {
                    return this.socketService.receive().pipe(
                        map(response => {
                            console.log("SOCKET RESPONSE FROM EFFECTS", response)
                            // QUESTION: why is effects not receiving socket responses?
                            if (response.status_code !== 200) {
                                return new GameActions.FailOpenSocket(response.message, JSON.parse(response.payload));
                            }

                            switch (response.message) {
                                case (SocketSuccessResponses.GameLoaded):
                                    return new GameActions.UpdateSocketData(response.message, JSON.parse(response.payload));
                            }
                        }
                        ),
                        catchError(errorMessage => throwError(errorMessage))
                    )
                })
            )
    )

    startGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.START_GAME)
        )).subscribe(action =>
            this.socketService.startGame(action.gameID)
        )

}