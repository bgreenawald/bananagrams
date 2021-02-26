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
  private messages$ = this.socketService.receive();
  private openModal$ = this.messageBusService.openModal$;
  private _state$: Observable<Models.GameState>


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
    this._store.dispatch(new fromStore.LoadReservedGameIDs())
    this.route.params.subscribe(() => {
      console.log('testing')
    })
    // this.openSocket();
    this.getMessages();
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


  getMessages = (): Observable<any> => {
    // send off different actions in response to different socket messages? 
    return this.messages$.pipe(
      map(resp => {
        console.log(resp.message)
        if (resp.status_code !== 200) throw `error: ${resp.message}`
        const value = {
          "message": resp.message,
          "status_code": resp.status_code,
          "data": JSON.parse(resp.payload)
        };
        return value;
      }
      ),
      catchError(errorMessage => throwError(errorMessage))
    )
  }

  openSocket = (): void => {
    this.messages$.subscribe(response => {
      if (response.status_code !== 200) this._store.dispatch(new fromStore.LoadGameFail(response.message));

      switch (response.message) {
        case (SocketSuccessResponses.GameLoaded):
          this._store.dispatch(new fromStore.UpdateSocketData(response.message, JSON.parse(response.payload)));
      }
    }
    )
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
