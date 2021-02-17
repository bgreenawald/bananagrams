import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as Models from './../../models';

export const getUserState = createFeatureSelector<Models.UserState>('user');
