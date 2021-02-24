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
    this.detectIDChange();
    this.setCachedData();
    this.socketSubscribe();
    this._state$ = this._store.select(fromStore.getGameStateSelector);
    this.openSocket();
    this._store.dispatch(new fromStore.LoadReservedGameIDs())
    // this.route.paramMap.subscribe(params => {
    //   console.log("GAME ID", params.get('id'))
    //   this.gameID = params['id']
    // })
    this.route.params.subscribe(() => {
      console.log('testing')
    })
  }

  // listen for game id from router store
  detectIDChange = () => {
    this.router.events.pipe(
      filter(event => event instanceof ActivationEnd),
      map(e => e instanceof ActivationEnd ? e.snapshot.params.id : {})
    ).subscribe(id => {
      if (!id) return;
      this._store.dispatch(new GameActions.SetGameID(id));
      this._store.dispatch(new GameActions.LoadGame(id))
    })
  }

  setCachedData = () => {
    const cachedPlayerID = localStorage.getItem("player_id");
    this._store.dispatch(new GameActions.SetPlayerId(cachedPlayerID));
  }

  getGameID = (): string => this.gameID;

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

      console.log("SUBSCRIBE TO SOCKET", response)
      if (response.status_code !== 200) this._store.dispatch(new fromStore.LoadGameFail(response.message));

      switch (response.message) {
        case (SocketSuccessResponses.GameLoaded):
          this._store.dispatch(new fromStore.UpdateSocketData(response.message, JSON.parse(response.payload)));
      }
    }
    )
  }

  // ROUTING
  socketSubscribe = () => {
    // changes UI as necessary
    this.getMessages()
      .subscribe(value => {
        console.log("SOCKET RESPONSE", value)
        switch (value.data.state) {
          case "IDLE":
            this.router.navigate([`/lobby/${this.gameID}`]);
            break;
          case "ACTIVE":
            const allPlayers: string[] = Object.keys(value.data.players);
            if (allPlayers.includes(this.playerID)) {
              this.router.navigate([`/game/${this.gameID}`]);
            }
            else {
              // show cannot join game until over
              this.router.navigate([`**`]);
            }
            break;
          case "ENDGAME":
            break;
          case "OVER":
            this.messageBusService.openModal('review')
            break;
          default:
            this.router.navigate([`**`]);
            break;
        }
      },
        err => this.errorService.displayError(err)
      )
    // this.router.navigate([`/game/${this.gameID}`]);

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
