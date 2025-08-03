import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'lobby/:id', loadComponent: () => import('./components/lobby/lobby.component').then(m => m.LobbyComponent) },
  { path: 'game/:id', loadComponent: () => import('./components/game/game.component').then(m => m.GameComponent) },
  { path: '', loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent) },
  { path: '**', loadComponent: () => import('./components/pagenotfound/pagenotfound.component').then(m => m.PagenotfoundComponent) }
];
