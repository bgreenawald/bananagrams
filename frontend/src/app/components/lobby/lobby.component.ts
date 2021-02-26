import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ActionReducerMap, createFeatureSelector, createSelector, Store, select } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { take } from 'rxjs/operators';
import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';

import { Socket } from 'ngx-socket-io';


import { SocketService } from '../../services/socket.service';
import { ErrorService } from '../../services/error.service';
import { AppComponent } from '../../app.component';

import * as Selectors from '../../store/selectors';


import * as Models from './../../models';

import * as fromStore from './../../store';
import { GameActionTypes } from './../../store';
import * as GameActions from './../../store/actions/game.actions'

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  public gameID: string; // numerical game id formatted as a string
  public playerJoined: boolean = false;
  public playerID: string;
  public playersInLobby: string[] = [];
  public error: string;
  private messages$ = this.app.getMessages();

  constructor(
    public app: AppComponent,
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private socketService: SocketService,
    private _store: Store<Models.GameState>,
    private action$: Actions<GameActionTypes>
  ) { }

  ngOnInit(): void {
    this.checkCache();
    this.listenToStore();  // probably need to destroy this??
    this.loadLobby();
  }

  getGameID = () => {
    this._store.pipe(select(fromStore.selectGameID)).subscribe(gameID => {
      this.gameID = gameID;
      console.log('game id is', gameID)
    });
  }


  loadLobby = () => {
    this._store.dispatch(new fromStore.OpenSocket(this.gameID))
    this.action$.pipe(
      ofType(GameActions.LOAD_GAME_SUCCESS)
    ).subscribe(() =>
      this._store.dispatch(new fromStore.LoadOrCreateGame(this.gameID))
    )
  }

  listenToStore = () => {
    // this._store.pipe(select(fromStore.getPlayerIDSelector)).subscribe(id => {
    //   console.log('player id', id)
    //   this.playerID = id;
    //   this.autoJoin(this.playerID);
    // })
    this._store.pipe(select(fromStore.getGameDataSelector)).subscribe(gameData => this.playersInLobby = gameData.players)
  }

  checkCache = () => {
    const playerName = localStorage.getItem("player_id");
    console.log("CACHED NAME", playerName)
    if (playerName) this.playerJoin(playerName);
  }

  playerJoin = (playerID: string): void => {
    if (!playerID) return;
    // TODO: disable join the game button if input is empty

    this._store.dispatch(new fromStore.SetPlayerId(this.gameID, playerID));
    console.log("submitted player name", playerID)
    localStorage.setItem("player_id", playerID);

    // this.socketService.playerJoin(this.gameID, playerID);
  }

  startGame = (): void => {
    this.socket.emit("start_game", {
      "name": this.gameID
    })
  }
}
