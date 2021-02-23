import { ActionReducerMap } from '@ngrx/store';
import * as coreRouter from '@ngrx/router-store';

export const routerReducer: ActionReducerMap<any> = {
    routerReducer: coreRouter.routerReducer
}