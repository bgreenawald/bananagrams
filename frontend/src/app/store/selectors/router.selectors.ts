import { ActivatedRouteSnapshot, RouterStateSnapshot, Params } from '@angular/router';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RouterReducerState, getRouterSelectors, RouterStateSerializer } from '@ngrx/router-store';

// Router state interface
export interface RouterStateUrl {
  url: string;
  queryParams: Params;
  params: Params;
}

// Router state type
export interface State {
  router: RouterReducerState<RouterStateUrl>;
}

// Feature selector for router
export const selectRouterState = createFeatureSelector<RouterReducerState<RouterStateUrl>>('router');

// Get router selectors from NgRx
export const {
  selectCurrentRoute,
  selectFragment,
  selectQueryParams,
  selectQueryParam,
  selectRouteParams,
  selectRouteParam,
  selectRouteData,
  selectUrl,
  selectTitle
} = getRouterSelectors(selectRouterState);

// Custom game ID selector from route params
export const selectGameID = createSelector(
  selectRouteParams,
  (params) => params?.['id']
);

// Custom router state serializer
export class CustomRouterStateSerializer implements RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    const { url } = routerState;
    const { queryParams } = routerState.root;

    let state: ActivatedRouteSnapshot = routerState.root;
    // Gets the last param in the URL
    while (state.firstChild) {
      state = state.firstChild;
    }

    const { params } = state;

    return { url, queryParams, params };
  }
}

// Legacy selectors for backward compatibility
export const selectRouter = selectRouterState;
export const getRouterState = selectRouterState;