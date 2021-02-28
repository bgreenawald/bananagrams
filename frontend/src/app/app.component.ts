import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterState, ActivationEnd } from '@angular/router';

import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first, filter, takeUntil, finalize, switchMap } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import * as fromStore from './store';

import { Socket } from 'ngx-socket-io';
import { SocketService } from './services/socket.service';
import { HelperService } from './services/helper.service'
import { ErrorService } from './services/error.service';
import { MessageBusService } from './services/message-bus.service';

import * as GameActions from './store/actions';
import { SocketSuccessResponses } from './constants';

import * as Models from "./models";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'frontend';
  public gameID: string; // TO REMOVE
  public playerID: string;
  public playersInLobby: string[];
  public tiles: string[];
  private playersTiles: string[];
  private _socketSubscription$;
  private openModal$ = this.messageBusService.openModal$;
  private _state$: Observable<Models.GameState>;
  // private _socketStream$ = this.socketService.receive();
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

  ngOnInit() {
    this.setCachedData();
    this._state$ = this._store.select(fromStore.getGameStateSelector);
    // this.route.params.subscribe(() => {
    //   console.log('testing')
    // })
    this.openSocket();
  }

  ngOnDestroy() {
    this._socketSubscription$.unsubscribe();
    this.socketService.disconnect();
  }

  setCachedData = () => {
    const cachedPlayerID = localStorage.getItem("player_id");
    // this._store.dispatch(new GameActions.SetPlayerId(this.gameID, cachedPlayerID));
  }

  getPlayers = (): string[] => this.playersTiles;

  getUserTiles = () => this.tiles;

  // TODO: refactor
  // better name for this is, listen to socket events server observable and parse response data
  // better named getSocketResponseData or socketResponseData$

  openSocket = (): void => {
    console.log("OPENING A NEW SOCKET LISTENER")
    this._socketStream$ = this.socketService.receive();
    this._store.dispatch(new fromStore.SocketReady());

    this._socketSubscription$ = this._socketStream$.subscribe(response => {
      console.log("received new response", response)

      if (response.status_code !== 200) {
        this._store.dispatch(new fromStore.LoadGameFail(response.message));
        return;
      }

      const resp = this.formatRawResponse(response)
      this._store.dispatch(new fromStore.UpdateSocketData(resp.message, resp.payload));


      // switch (resp.message) {
      //   case (SocketSuccessResponses.GameLoaded):
      //     this._store.dispatch(new fromStore.UpdateSocketData(resp.message, resp.payload));
      // }
    }
    )
  }

  formatRawResponse = rawData => {
    return {
      "message": rawData.message,
      "status_code": rawData.status_code,
      "payload": JSON.parse(rawData.payload)
    };
  }

  handleClick = (e) => {
    // is the clicked element NOT the swap button
    const didClickOutsideSwap: boolean = !e.target.classList.contains('swap');
    const swapButton = document.querySelector('button.swap');
    if (swapButton && didClickOutsideSwap) {
      this.helperService.globalClick('click')
    }
    const isModalOpen: boolean = !!document.querySelector('.modal');
    const didClickOutsideModal: boolean = e.target.classList.contains('overlay');
    if (isModalOpen && didClickOutsideModal) this.helperService.globalClick('click');
  }
}
