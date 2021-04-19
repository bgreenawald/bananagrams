import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as ChalkfulActions from '../actions';
import * as endpointServices from '../../services/api.service';
import * as SocketServices from '../../services/socket.service';

import { Effect, Actions, ofType, createEffect } from '@ngrx/effects';
import { switchMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs';

import { SocketSuccessResponses } from './../../constants';

import * as ChalkfulStore from './../index';
import * as Selectors from './../selectors';
import * as Models from './../../models';
import { fromStringWithSourceMap } from 'source-list-map';



@Injectable()
export class UserEffects {
    constructor(
        private actions$: Actions<ChalkfulActions.UserActions>,
        private endpointService: endpointServices.ApiService,
        private socketService: SocketServices.SocketService,
        private _store: Store<Models.GameState>
    ) { }

    callBananagrams$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ChalkfulActions.CALL_BANANAGRAMS),
            withLatestFrom(this._store.select(Selectors.getPlayerIDSelector)),
            tap(([action, playerID]) => {
                this.socketService.userCallBananagrams(action.gameID, playerID, action.words);
            })
        ), { dispatch: false }
    );

    resetGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ChalkfulActions.RESET_GAME),
            tap(action => this.socketService.startGame(action.gameID))
        ), { dispatch: false });

    swapTile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ChalkfulActions.SWAP_TILES),
            withLatestFrom(
                this._store.select(Selectors.getPlayerIDSelector),
                this._store.select(Selectors.getPlayerTiles),
                this._store.select(Selectors.selectGameID)
            ),
            tap(([action, playerID, tiles, gameID]) => {
                this.socketService.swapTiles(gameID, action.letter, playerID)
            })
        ), { dispatch: false }
    );
}
