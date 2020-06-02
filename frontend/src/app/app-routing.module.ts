import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { LandingComponent } from './components/landing/landing.component';
import { GameComponent } from './components/game/game.component';
import { PageNotFoundComponent } from './components/pagenotfound/pagenotfound.component'



const routes: Routes = [
  { path: 'lobby/:id', component: LobbyComponent },
  { path: 'game/:id', component: GameComponent },
  { path: '', component: LandingComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
