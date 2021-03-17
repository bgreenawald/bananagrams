import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterState, ActivationEnd } from '@angular/router';

import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first, filter, takeUntil, finalize, switchMap, take } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import * as fromStore from './store';

import { Socket } from 'ngx-socket-io';
import { SocketService } from './services/socket.service';
import { HelperService } from './services/helper.service';
import { ErrorService } from './services/error.service';
import { MessageBusService } from './services/message-bus.service';

import * as GameActions from './store/actions';
import { SocketSuccessResponses } from './constants';

import * as Models from './models';
import * as Constants from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'frontend';
  public gameID: string; // TO REMOVE
  public playerID: string;
  public playersInRoom: string[];
  private playersTiles: string[];
  private _socketSubscription$;
  private openModal$ = this.messageBusService.openModal$;
  private _state$: Observable<Models.GameState>;
  private _socketStream$: Observable<any>;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private errorService: ErrorService,
    private helperService: HelperService,
    private messageBusService: MessageBusService,
    private socketService: SocketService,
    private _store: Store<Models.GameState>,
    private _routerStore: Store<any>) { }

  public ngOnInit() {
    this._loadCachedData();
    this._state$ = this._store.select(fromStore.getGameStateSelector);
    this._store.select(fromStore.getPlayerIDSelector).subscribe(playerID => {
      this.playerID = playerID;
    });
    this._setDataFromStore();
  }

  public ngOnDestroy() {
    this._socketSubscription$.unsubscribe();
    this.socketService.disconnect();
  }

  private _setDataFromStore = (): void => {
    this._store
      .select(fromStore.getAllPlayers)
      .subscribe(
        playersArray => {
          this.playersInRoom = playersArray;
        }
      );

    this._store
      .select(fromStore.getPlayerIDSelector)
      .subscribe(
        username => {
          this.playerID = username;
          this._openSocket();
        }
      );
  }

  private _loadCachedData = () => {
    this.playerID = localStorage.getItem('player_id');
  }

  // TODO: refactor
  // better name for this is, listen to socket events server observable and parse response data
  // better named getSocketResponseData or socketResponseData$

  private _openSocket = (): void => {
    this._socketStream$ = this.socketService.receive();
    this._store.dispatch(new fromStore.SocketReady());

    this._socketSubscription$ = this._socketStream$.subscribe(response => {
      console.log('received new response', response);

      if (response.status_code !== 200) {
        this._store.dispatch(new fromStore.LoadGameFail(response.message));
        return;
      }


      const resp = this._formatRawResponse(response);

      this._store.dispatch(new fromStore.UpdateSocketData(resp.message, resp.payload));


      if (resp.message.includes("Performed swap")) {
        this._store.select(fromStore.getPlayerTiles).subscribe(tiles => {
          this._store.dispatch(new GameActions.UpdatePeeledTiles(tiles))
        })
      }
      else if (resp.message === Constants.SocketSuccessResponses.Peel) {
        this._store.dispatch(new fromStore.AddPeeledTile());
      }
      else {
        console.log(resp.message, resp.status_code, resp.payload);
      }



      const gameID = resp.payload.id;

      // ui routing
      switch (resp.payload.state) {
        case 'IDLE':
          this.router.navigate([`/lobby/${gameID}`]);
          break;
        case 'ACTIVE':
          if (this._allowedToJoinGame(this.playerID)) {
            this.router.navigate([`/game/${gameID}`]);
          }
          else {
            // show cannot join game until over
            this.router.navigate([`**`]);
          }
          break;
        case 'ENDGAME':
          break;
        case 'OVER':
          this.messageBusService.openModal('review');
          break;
        default:
          this.router.navigate([`**`]);
          break;
      }
    }
    );
  }

  private _allowedToJoinGame = (playerID: string): boolean => {
    return this.playersInRoom.includes(this.playerID);
  }

  private _formatRawResponse = (rawData): Models.RawSocketResponse => {
    return {
      message: rawData.message,
      status_code: rawData.status_code,
      payload: JSON.parse(rawData.payload)
    };
  }

  public handleClick = (e): void => {
    // is the clicked element NOT the swap button
    const didClickOutsideSwap: boolean = !e.target.classList.contains('swap');
    const swapButton = document.querySelector('button.swap');
    if (swapButton && didClickOutsideSwap) {
      this.helperService.globalClick('click');
    }
    const isModalOpen: boolean = !!document.querySelector('.modal');
    const didClickOutsideModal: boolean = e.target.classList.contains('overlay');
    if (isModalOpen && didClickOutsideModal) { this.helperService.globalClick('click'); }
  }
}
