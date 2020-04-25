import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { LandingComponent } from './components/landing/landing.component';
import { BoardComponent } from './components/board/board.component';


const routes: Routes = [
  { path: 'lobby', component: LobbyComponent },
  { path: '', component: LandingComponent },
  { path: 'game', component: BoardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
