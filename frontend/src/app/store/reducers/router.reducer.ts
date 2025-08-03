import { ActionReducerMap } from '@ngrx/store';
import { routerReducer } from '@ngrx/router-store';

export interface RouterState {
  router: any;
}

export const routerReducers: ActionReducerMap<RouterState> = {
  router: routerReducer
};