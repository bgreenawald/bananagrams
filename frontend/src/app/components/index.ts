import { BenchComponent } from './bench/bench.component';
import { BoardComponent } from './board/board.component';
import { LandingComponent } from './landing/landing.component';
import { CellComponent } from './cell/cell.component';
import { GameComponent } from './game/game.component';
import { GameoverComponent } from './gameover/gameover.component';
import { LobbyComponent } from './lobby/lobby.component';
import { MenuGameplayComponent } from './menu-gameplay/menu-gameplay.component';
import { SelectionModel } from '@angular/cdk/collections';
import { ModalComponent } from './modal/modal.component';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { TileComponent } from './tile/tile.component';


export const components: any[] = [
    BenchComponent,
    BoardComponent,
    CellComponent,
    GameComponent,
    GameoverComponent,
    LandingComponent,
    LobbyComponent,
    MenuGameplayComponent,
    ModalComponent,
    PageNotFoundComponent,
    TileComponent
]

export * from './bench/bench.component';
export * from './board/board.component';
export * from './landing/landing.component';
export * from './cell/cell.component';
export * from './game/game.component';
export * from './gameover/gameover.component';
export * from './lobby/lobby.component';
export * from './menu-gameplay/menu-gameplay.component';
export * from '@angular/cdk/collections';
export * from './modal/modal.component';
export * from './pagenotfound/pagenotfound.component';
export * from './tile/tile.component';