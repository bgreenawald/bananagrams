import { Component, HostListener, OnInit, ViewEncapsulation, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, of, fromEvent, throwError, Subject, timer } from 'rxjs';
import { catchError, map, tap, first, takeUntil, take, takeWhile, distinct, debounce, filter } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { ErrorService } from '../../services/error.service';
import { SocketService } from '../../services/socket.service';
import { MessageBusService } from '../../services/message-bus.service';
import { EventHandleService } from '../../services/event-handle.service';

import { Tile } from '../../interfaces';
import * as Selectors from '../../store/selectors';
import * as GameActions from '../../store/actions/game.actions';
import * as UserActions from '../../store/actions/user.actions';

import { MenuGameplayComponent } from '../menu-gameplay/menu-gameplay.component';
import { CellComponent } from '../cell/cell.component';
import { BoardComponent } from '../board/board.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, MenuGameplayComponent, CellComponent, BoardComponent, ModalComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventHandleService = inject(EventHandleService);
  private errorService = inject(ErrorService);
  private messageBusService = inject(MessageBusService);
  private socketService = inject(SocketService);
  private _store = inject(Store);
  private _action$ = inject(Actions);

  public benchTiles: Tile[] = [];
  public error: string = '';
  public gameID: string = ''; // numerical game id formatted as a string
  public modal: {
    message: string
  } = { message: '' };
  public playerJoined = false;
  public playerID: string = '';
  public playersTiles: string[] = [];
  public tiles: string[] = [];
  public modalOpen = false;
  public confirmMessage: string = '';

  private openModal$ = this.messageBusService.openModal$;
  private _modifyCell$ = this.eventHandleService.removeCell$;
  private _ngDestroyed$ = new Subject<void>();

  @HostListener('window:beforeunload', ['$event'])
  confirmExit($event: any) {
    $event.preventDefault();
    $event.returnValue = 'Are you sure you want to leave? This will clear your board.';
  }

  ngOnInit(): void {
    this._getPlayerID();
    this.tileEventListen();
    this._rejoinRoom();
    this._initializeTiles();
    this._listenUpdateTiles();
  }

  public ngOnDestroy(): void {
    this._ngDestroyed$.next();
    this._ngDestroyed$.complete();
  }

  private _rejoinRoom = () => {
    // if not yet loaded.
    this._store.pipe(
      take(1),
      select(Selectors.selectLoadedStatus))
      .subscribe(isLoaded => {

        if (!isLoaded) {
          this._store
            .select(Selectors.selectGameID)
            .subscribe(gameID => {
              this.gameID = gameID;
            });

          this._store.dispatch(GameActions.joinRoom({ gameID: this.gameID }));
          this._store.dispatch(GameActions.loadOrCreateGame({ gameID: this.gameID }));
        }
      });
  }

  private _loadGameData = (gameID: string) => {
    this._store.pipe(
      take(1),
      select(Selectors.selectLoadedStatus)
    ).subscribe(isLoaded => {
      if (!isLoaded) {
        this._store
          .select(Selectors.selectGameID)
          .subscribe(gameID => {
            this.gameID = gameID;
            this._store.dispatch(GameActions.loadOrCreateGame({ gameID }));
          });
      }
    });
  }

  private _loadBoard = () => {
    this._initializeTiles();
  }

  _getPlayerID = () => {
    this.playerID = localStorage.getItem('player_id') || '';
  }

  setTiles = (tiles: string[]) => {
    if (tiles.length <= 0) { return; }
    if (this.benchTiles.length <= 0) {
      this._initializeTiles();
    }
    else {
      this.updateTiles(tiles);
    }
    this.tiles = tiles;
  }

  findDifference = (tiles: string[]) => {
    const oldTiles = this.tiles.slice();
    const newTiles = tiles.slice();
    for (const letter of oldTiles) {
      const index = newTiles.indexOf(letter);
      if (index > -1) {
        newTiles.splice(index, 1);
      }
    }
    return newTiles;
  }

  updateTiles = (tiles: string[]) => {
    const newTiles = this.findDifference(tiles);
    let lastTileIndex = this.tiles.length - 1;
    newTiles.forEach(tile => {
      this.benchTiles.push({
        letter: tile,
        id: (lastTileIndex++).toString()
      });
    });
    this.tiles = tiles;
  }

  _listenUpdateTiles = () => {
    this._action$.pipe(
      ofType(GameActions.addPeeledTile, UserActions.updatePeeledTiles),
      takeUntil(this._ngDestroyed$)
    ).subscribe(() => {
      this._store.select(Selectors.getPlayerTiles)
        .subscribe(allNewTiles => {
          this.updateTiles(allNewTiles);
        });
      console.log('adding new tile');
    });
  }

  tileEventListen = () => {
    // Listen into observable for events, which give index of tile to remove from bench
    this._modifyCell$.pipe(
      takeUntil(this._ngDestroyed$)
    ).subscribe((cellIndexArray: number[]) => {
      if (cellIndexArray.length > 1) { cellIndexArray.sort(((a, b) => b - a)); }
      cellIndexArray.forEach(index => {
        this.benchTiles.splice(index, 1);
      });
      console.log(this.benchTiles);
    });
  }

  _initializeTiles = () => {
    this._store
      .select(Selectors.getPlayerTiles)
      .pipe(
        filter(tiles => !!tiles),
        first(),
        takeUntil(this._ngDestroyed$)
      )
      .subscribe(tiles => {
        this.tiles = tiles;
        this._renderTiles(this.tiles);
      });
  }

  _renderTiles = (tiles: string[]) => {
    let i = 0;
    tiles.forEach(tile => {
      this.benchTiles.push({
        letter: tile,
        id: (i++).toString()
      });
    });
  }
}