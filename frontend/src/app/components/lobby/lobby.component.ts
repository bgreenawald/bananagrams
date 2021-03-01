import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ActionReducerMap, createFeatureSelector, createSelector, Store, select } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { take, takeUntil } from 'rxjs/operators';
import { Observable, of, fromEvent, throwError, Subject } from 'rxjs';
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
  // private messages$ = this.app.getMessages();
  public ngDestroyed$ = new Subject();
  public isEditingName: boolean = false;

  constructor(
    public app: AppComponent,
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private socketService: SocketService,
    private _store: Store<Models.GameState>,
    private action$: Actions<GameActions.GameActionTypes>
  ) { }

  public ngOnInit(): void {
    this.getPlayersInLobby();  // probably need to destroy this??
    this.getGameID();
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
  }

  getGameID = () => {
    this._store.pipe(
      takeUntil(this.ngDestroyed$))
      .pipe(select(fromStore.selectGameID)).subscribe(gameID => {
        this.gameID = gameID;
        this.joinRoom();
      });
  }

  joinRoom = () => {
    this.action$.pipe(
      ofType(GameActions.SUCCESS_JOIN_ROOM),
      take(1)
    ).subscribe(() => {
      this._store.dispatch(new fromStore.LoadOrCreateGame(this.gameID))
      this.checkCachedPlayerID();
    })
    this._store.dispatch(new fromStore.JoinRoom(this.gameID))
  }

  getPlayersInLobby = () => {
    this._store
      .pipe(
        takeUntil(this.ngDestroyed$))
      .pipe(select(fromStore.getAllPlayers))
      .subscribe(playersInRoom => {
        this.playersInLobby = playersInRoom;
        console.log(playersInRoom)
        // const isGameDataLoaded = Object.keys(gameData).length > 0 ? true : false;
        // if (isGameDataLoaded) this.playersInLobby = Object.keys(gameData.players)
      })
  }

  checkCachedPlayerID = () => {
    this.playerID = localStorage.getItem("player_id");
    if (this.playerID) this.playerJoin(this.playerID);
  }

  playerJoin = (playerID: string): void => {

    // TODO: disable join the game button if input is empty
    this._store.dispatch(new fromStore.SetPlayerId(this.gameID, playerID));
    localStorage.setItem("player_id", playerID);
  }

  startGame = (): void => {
    this.socket.emit("start_game", {
      "name": this.gameID
    })
  }

  editPlayerName = () => {
    this.isEditingName = true;
  }

  updatePlayerID = (newUsername: string) => {
    this.isEditingName = false;
    // make backend call to update userid. 

  }
}
