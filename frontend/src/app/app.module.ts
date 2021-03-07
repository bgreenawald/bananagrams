import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { reducers, effects } from './store';
import * as selectors from './store/selectors';
import { StoreRouterConnectingModule, RouterStateSerializer, routerReducer } from '@ngrx/router-store';


import { LobbyComponent } from './components/lobby/lobby.component';
import { BoardComponent } from './components/board/board.component';
import { LandingComponent } from './components/landing/landing.component';
import { GameoverComponent } from './components/gameover/gameover.component';
import { PageNotFoundComponent } from './components/pagenotfound/pagenotfound.component';
import { TileComponent } from './components/tile/tile.component';
import { CellComponent } from './components/cell/cell.component';
import { BenchComponent } from './components/bench/bench.component';
import { GameComponent } from './components/game/game.component';
import { MenuGameplayComponent } from './components/menu-gameplay/menu-gameplay.component';
import { ModalComponent } from './components/modal/modal.component';
import * as fromComponents from './components';

import { environment } from "../environments/environment";
import { Routes, RouterModule } from '@angular/router';
import { CustomSerializer } from './store/selectors/router.selectors';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const config: SocketIoConfig = { url: environment.backendUrl, options: {} };

export const ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LandingComponent
  },
  {
    path: 'lobby/:gameID',
    component: LobbyComponent
  },
  {
    path: 'game/:gameID',
    component: BoardComponent
  }
]

@NgModule({
  declarations: [
    AppComponent,
    ...fromComponents.components
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
    DragDropModule,
    StoreModule.forRoot({
      game: reducers.gameReducer,
      user: reducers.userReducer,
      router: routerReducer
    }, {}),
    StoreDevtoolsModule.instrument(),
    EffectsModule.forRoot(effects),
    StoreRouterConnectingModule.forRoot({ serializer: CustomSerializer }),
    RouterModule.forChild(ROUTES),
    FontAwesomeModule
  ],
  providers: [{ provide: RouterStateSerializer, useClass: CustomSerializer }],
  bootstrap: [AppComponent]
})
export class AppModule { }
