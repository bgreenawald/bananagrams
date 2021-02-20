import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as ChalkfulActions from '../actions';
import * as endpointServices from '../../services/api.service';
import * as SocketServices from '../../services/socket.service';

import { Effect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs';

import { SocketSuccessResponses } from './../../constants';

import * as ChalkfulStore from './../index';
import * as Selectors from './../selectors';
import * as Models from './../../models';



@Injectable()
export class UserEffects {
    selectors = this._store
    constructor(
        private actions$: Actions,
        private endpointService: endpointServices.ApiService,
        private socketService: SocketServices.SocketService,
        private _store: Store<Models.GameState>
    ) { }

    // @Effect()
    // callBananagrams$ = this.actions$.pipe(
    //     ofType(ChalkfulActions.CALL_BANANAGRAMS)
    // )
    //     .pipe(
    //         withLatestFrom(this._store.pipe(select(Selectors.selectPlayerID))
    //         switchMap(() => {
    //                 return this.socketService.userCallBananagrams().pipe(
    //                     map(userData => new GameActions.LoadGameSuccess(userData)),
    //                     catchError(err => of(new GameActions.LoadGameFail(err)))
    //                 )
    //             })
    //         )

    @Effect()
    resetGame$ = this.actions$.pipe(
        ofType(ChalkfulActions.RESET_GAME)
    ).pipe(
        // withLatestFrom(this._store.pipe(select(Selectors.getGameStateSelector))),
        switchMap(_ => {
            this.socketService.reset('gameid') // Question: How to exactly verify if the socket service was successful?
            return of('game successfully reset')
            // Should I just comment this all out b/c the socketService doesn't return a response?    
            // .pipe(
            //     // QUESTION: Where to put the params - in service call or in effects??  
            //     map(resp => new ChalkfulActions.LoadGameSuccess(resp)),
            //     catchError(error => of(new ChalkfulActions.LoadGameFail(error)))
            // )
        })
    )
}