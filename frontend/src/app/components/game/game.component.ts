import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Socket } from 'ngx-socket-io';

import { Observable, of, fromEvent, throwError, Subject, timer } from 'rxjs';
import { catchError, map, tap, first, takeUntil, take, takeWhile, distinct, debounce, filter } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { ErrorService } from '../../services/error.service';
import { SocketService } from '../../services/socket.service';
import { MessageBusService } from '../../services/message-bus.service';

import { EventHandleService } from '../../services/event-handle.service';

import { Tile } from '../../models';
import * as Models from '../../models';
import * as Selectors from '../../store/selectors';
import * as GameActions from '../../store/actions';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements OnInit {


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private eventHandleService: EventHandleService,
    private errorService: ErrorService,
    private messageBusService: MessageBusService,
    private socketService: SocketService,
    private _store: Store<Models.GameState>,
    private _action$: Actions<GameActions.GameActionTypes>,
  ) { }
  public benchTiles: Tile[] = [];
  public error: string;
  public gameID: string; // numerical game id formatted as a string
  public modal: {
    message: string
  };
  public playerJoined = false;
  public playerID: string;
  public playersTiles: string[];
  public tiles: string[];
  public modalOpen = false;
  public confirmMessage: string;

  private openModal$ = this.messageBusService.openModal$;
  // private _messages$ = this.app.getMessages();
  private _modifyCell$ = this.eventHandleService.removeCell$;
  private _ngDestroyed$ = new Subject();
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

          this._store.dispatch(new GameActions.JoinRoom(this.gameID));
          this._store.dispatch(new GameActions.LoadOrCreateGame(this.gameID));

        }
      });
  }

  private _loadGameData = (gameID) => {
    this._store.pipe(
      take(1),
      select(Selectors.selectLoadedStatus)
    ).subscribe(isLoaded => {
      if (!isLoaded) {
        this._store
          .select(Selectors.selectGameID)
          .subscribe(gameID => {
            this.gameID = gameID;
            this._store.dispatch(new GameActions.LoadOrCreateGame(gameID));
          });
      }

      else {

      }
    });
  }

  private _loadBoard = () => {
    this._initializeTiles();
  }

  _getPlayerID = () => {
    this.playerID = localStorage.getItem('player_id');
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

  updateTiles = (tiles) => {
    const newTiles = this.findDifference(tiles);
    let lastTileIndex = this.tiles.length - 1;
    newTiles.forEach(tile => {
      this.benchTiles.push({
        letter: tile,
        id: lastTileIndex++
      });
    });
    this.tiles = tiles;
  }

  _listenUpdateTiles = () => {
    this._action$.pipe(
      ofType(GameActions.ADD_PEELED_TILE, GameActions.UPDATE_PEELED_TILES)
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
    this._modifyCell$.subscribe((cellIndexArray: number[]) => {
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
        first()
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
        id: i++
      });
    });
  }
}
