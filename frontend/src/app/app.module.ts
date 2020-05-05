import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { DragDropModule } from '@angular/cdk/drag-drop';


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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const config: SocketIoConfig = { url: 'http://localhost:5000', options: {} };

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
    MenuGameplayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
