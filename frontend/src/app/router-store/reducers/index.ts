import * as coreRouterStore from '@ngrx/router-store';
import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { Params } from '@angular/router';

export interface RouterStateUrl {
    url: string;
    queryParams: Params;
    params: Params;
}

export interface State {
    routerReducer: coreRouterStore.RouterReducerState<RouterStateUrl>;
}

export const reducers: ActionReducerMap<State> = {
    routerReducer: coreRouterStore.routerReducer
}

// selector for getting router state
export const getRouterState = createFeatureSelector<
    coreRouterStore.RouterReducerState<RouterStateUrl>
    >('routerReducer');