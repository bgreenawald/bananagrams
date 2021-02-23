import { ActivatedRouteSnapshot, RouterStateSnapshot, Params, RouterState } from '@angular/router';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import * as coreRouterStore from '@ngrx/router-store';

import * as fromStore from './../index';

export const selectRouter = createFeatureSelector<coreRouterStore.RouterReducerState>('router');

export const {
    selectRouteParams,
    selectRouteParam
} = coreRouterStore.getSelectors(selectRouter);

export interface RouterStateUrl {
    url: string;
    queryParams: Params;
    params: Params;
}

export interface State {
    routerReducer: coreRouterStore.RouterReducerState<RouterStateUrl>;
}

export const routerReducers: ActionReducerMap<State> = {
    routerReducer: coreRouterStore.routerReducer
}

// selector for getting router state
export const getRouterState = createFeatureSelector<
    coreRouterStore.RouterReducerState<RouterStateUrl>
    >('routerReducer');

export const getGameID = createSelector(
    getRouterState,
    (routerState: any) => routerState.state.params.gameID
)

export class CustomSerializer
    implements coreRouterStore.RouterStateSerializer<RouterStateUrl>{
    serialize(routerState: RouterStateSnapshot): RouterStateUrl {
        const { url } = routerState;
        const { queryParams } = routerState.root;

        let state: ActivatedRouteSnapshot = routerState.root;
        // gets the last param in the URL
        while (state.firstChild) {
            state = state.firstChild
        }

        const { params } = state;
        // equivalent to above line: const params = state.params;

        return { url, queryParams, params };
    }
}