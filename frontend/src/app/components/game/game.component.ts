import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Socket } from 'ngx-socket-io';

import { Observable, of, fromEvent, throwError, Subject } from 'rxjs';
import { catchError, map, tap, first, takeUntil, take } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { ErrorService } from '../../services/error.service';
import { SocketService } from '../../services/socket.service';
import { MessageBusService } from '../../services/message-bus.service';

import { AppComponent } from '../../app.component';
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
  @HostListener('window:beforeunload', ['$event'])
  confirmExit($event: any) {
    $event.preventDefault();
    $event.returnValue = 'Are you sure you want to leave? This will clear your board.';
  }
  public benchTiles: Tile[] = [];
  public error: string;
  public gameID: string; // numerical game id formatted as a string
  public modal: {
    message: string
  }
  public playerJoined: boolean = false;
  public playerID: string = this.app.playerID;
  public playersTiles: string[];
  public tiles: string[];
  public modalOpen: boolean = false;
  public confirmMessage: string;

  private openModal$ = this.messageBusService.openModal$;
  // private _messages$ = this.app.getMessages();
  private _modifyCell$ = this.eventHandleService.removeCell$;
  private _ngDestroyed$ = new Subject();


  constructor(
    public app: AppComponent,
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private eventHandleService: EventHandleService,
    private errorService: ErrorService,
    private messageBusService: MessageBusService,
    private socketService: SocketService,
    private _store: Store<any>,
    private _action$: Actions<GameActions.GameActionTypes>,
  ) { }

  ngOnInit(): void {
    this._getPlayerID();
    // this.setGameID();
    // this.socketSubscribe();
    this.socketService.loadOrCreateGame(this.gameID);
    this.tileEventListen();
    this._rejoinRoom();
    // this._loadGameData();  why doesn't this work if on line 76, only on line 95?
    // this._loadBoard();
  }

  public ngOnDestroy(): void {
    this._ngDestroyed$.next();
  }

  private _rejoinRoom = () => {
    // if not yet loaded. 
    this._store.pipe(
      takeUntil(this._ngDestroyed$),
      select(Selectors.selectLoadedStatus))
      .subscribe(isLoaded => {
        if (isLoaded) return;

        this._store
          .select(Selectors.selectGameID)
          .subscribe(gameID => {
            this.gameID = gameID
            this._loadGameData();
            this._store.dispatch(new GameActions.JoinRoom(gameID));
          });

      })
  }

  private _loadGameData = () => {
    this._action$.pipe(
      ofType(GameActions.SUCCESS_JOIN_ROOM),
      take(1)
    ).subscribe(() => {
      this._store.dispatch(new GameActions.LoadOrCreateGame(this.gameID));
      this._loadBoard();
    })
  }

  private _loadBoard = () => {
    this._action$.pipe(
      ofType(GameActions.LOAD_GAME_SUCCESS),
      take(1)
    ).subscribe(action => {
      this._action$.pipe(
        ofType(GameActions.UPDATE_SOCKET_DATA),
        take(1)
      ).subscribe(() => {
        this._store
          .select(Selectors.getPlayerTiles)
          .subscribe(tiles => {
            this.tiles = tiles;
            this.initializeTiles(this.tiles);
          });
      })
    })
  }

  // setGameID = () => {
  //   const id = +this.route.snapshot.paramMap.get('id');
  //   this.gameID = id.toString();
  // }

  _getPlayerID = () => {
    this.playerID = localStorage.getItem("player_id")
  }

  // TODO: refactor
  // socketSubscribe = () => {
  //   this._messages$
  //     .subscribe(value => {
  //       const tileArray = value.data.players[this.playerID];
  //       if (value.message === "Game loaded." && !this.tiles) {
  //         this.initializeTiles(tileArray);
  //       }
  //       else this.updateTiles(tileArray);
  //       this.tiles = tileArray;
  //     },
  //       err => this.error = this.errorService.parseError(err)
  //     )
  // }

  setTiles = (tiles: string[]) => {
    if (tiles.length <= 0) return;
    if (this.benchTiles.length <= 0) {
      this.initializeTiles(tiles);
    }
    else {
      this.updateTiles(tiles);
    }
    this.tiles = tiles;
  }

  findDifference = (tiles: string[]) => {
    const oldTiles = this.tiles.slice();
    const newTiles = tiles.slice();
    for (let letter of oldTiles) {
      let index = newTiles.indexOf(letter);
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
      })
    });
  }

  tileEventListen = () => {
    // Listen into observable for events, which give index of tile to remove from bench
    this._modifyCell$.subscribe((cellIndexArray: number[]) => {
      if (cellIndexArray.length > 1) cellIndexArray.sort(((a, b) => b - a));
      cellIndexArray.forEach(index => {
        this.benchTiles.splice(index, 1)
      });
      console.log(this.benchTiles)
    })
  }

  initializeTiles = (tiles: string[]) => {
    let i = 0;
    tiles.forEach(tile => {
      this.benchTiles.push({
        'letter': tile,
        'id': i++
      })
    })
  }
}
