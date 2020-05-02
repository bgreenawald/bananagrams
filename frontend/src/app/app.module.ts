import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';


import { LobbyComponent } from './components/lobby/lobby.component';
import { BoardComponent } from './components/board/board.component';
import { LandingComponent } from './components/landing/landing.component';
import { GameoverComponent } from './components/gameover/gameover.component';
import { PageNotFoundComponent } from './components/pagenotfound/pagenotfound.component';
import { TileComponent } from './components/tile/tile.component';
import { CellComponent } from './components/cell/cell.component';

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
    CellComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
