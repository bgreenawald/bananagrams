import { Injectable } from '@angular/core';
import { Action, createAction, props } from '@ngrx/store';


// export const UPDATE_STORE = 'Add';

// export class UpdateStore implements Action {
//     readonly type = UPDATE_STORE
//     constructor(public payload: any) { }
// }

// export type Actions = UpdateStore;

export const updateStore = createAction('Update', props<{ payload: any }>());