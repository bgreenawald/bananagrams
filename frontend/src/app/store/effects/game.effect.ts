import { Injectable } from '@angular/core';
import * as GameActions from '../actions/game.actions';
import * as endpointServices from '../../services/api.service';

import { Effect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';

@Injectable()
export class GameEffects {
    constructor(
        private actions$: Actions,
        private endpointService: endpointServices.ApiService
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
}