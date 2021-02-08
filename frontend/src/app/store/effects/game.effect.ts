import { Injectable } from '@angular/core';
import * as GameActions from '../actions/game.actions';
import * as endpointServices from '../../services/api.service';
import * as SocketServices from '../../services/socket.service';

import { Effect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs';

import { SocketSuccessResponses } from './../../constants';



@Injectable()
export class GameEffects {
    constructor(
        private actions$: Actions,
        private endpointService: endpointServices.ApiService,
        private socketService: SocketServices.SocketService
    ) { }

    @Effect()
    loadGame$ = this.actions$.pipe(
        ofType(GameActions.LOAD_USER)
    )
        .pipe(
            switchMap(() => {
                return this.endpointService.getIDs().pipe(
                    map(userData => new GameActions.LoadGameSuccess(userData)),
                    catchError(err => of(new GameActions.LoadGameFail(err)))
                )
            })
        )

    openSocket$ = this.actions$.pipe(
        ofType(GameActions.OPEN_SOCKET)
    )
        .pipe(
            switchMap(_ => {
                return this.socketService.receive().pipe(
                    map(response => {
                        if (response.status_code !== 200) throw `error: ${response.message}`

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
}