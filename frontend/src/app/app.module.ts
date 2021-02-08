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

import { gameReducer } from './store/reducers/game.reducer';
import { reducers, effects } from './store';


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

import { environment } from "../environments/environment";

const config: SocketIoConfig = { url: environment.backendUrl, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    BoardComponent,
    LandingComponent,
    GameoverComponent,
    PageNotFoundComponent,
    TileComponent,
    CellComponent,
    BenchComponent,
    GameComponent,
    MenuGameplayComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
    DragDropModule,
    StoreModule.forRoot({
      game: gameReducer
    }, {}),
    // StoreModule.forFeature('game', gameReducer),
    StoreDevtoolsModule,
    EffectsModule.forRoot(effects)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
