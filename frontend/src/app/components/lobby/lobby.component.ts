import { Component, OnInit } from '@angular/core';

import { ActionReducerMap, createFeatureSelector, createSelector, Store, select } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { take, takeUntil } from 'rxjs/operators';
import { Observable, of, fromEvent, throwError, Subject } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';

import { Socket } from 'ngx-socket-io';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

import { SocketService } from '../../services/socket.service';
import { ErrorService } from '../../services/error.service';

import * as Selectors from '../../store/selectors';


import * as Models from './../../models';

import * as fromStore from './../../store';
import { GameActionTypes } from './../../store';
import * as GameActions from './../../store/actions/game.actions';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  public gameID: string; // numerical game id formatted as a string
  public playerID: string;
  public playersInLobby: string[] = [];
  public error: string;
  public ngDestroyed$ = new Subject();
  public isEditingName = false;
  public faEdit = faEdit;
  public startButtonEnabled = false;

  constructor(
    private errorService: ErrorService,
    private socketService: SocketService,
    private _store: Store<Models.GameState>,
    private action$: Actions<GameActions.GameActionTypes>
  ) { }

  public ngOnInit(): void {
    this.getPlayersInLobby();  // probably need to destroy this??
    this.getGameID();
    this._listenErrors();
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
  }

  public getGameID = (): void => {
    this._store.pipe(
      takeUntil(this.ngDestroyed$))
      .pipe(select(fromStore.selectGameID)).subscribe(gameID => {
        this.gameID = gameID;
        this.joinRoom();
      });
  }

  public joinRoom = (): void => {
    this.action$.pipe(
      ofType(GameActions.SUCCESS_JOIN_ROOM),
      take(1)
    ).subscribe(() => {
      this._store.dispatch(new fromStore.LoadOrCreateGame(this.gameID));
      this.checkCachedPlayerID();
    });
    this._store.dispatch(new fromStore.JoinRoom(this.gameID));
  }

  public getPlayersInLobby = (): void => {
    this._store
      .pipe(
        takeUntil(this.ngDestroyed$))
      .pipe(select(fromStore.getAllPlayers))
      .subscribe(playersInRoom => {
        this.playersInLobby = playersInRoom;
        if (this.playersInLobby.length > 1) { this.startButtonEnabled = true; }
        console.log(playersInRoom);
        // const isGameDataLoaded = Object.keys(gameData).length > 0 ? true : false;
        // if (isGameDataLoaded) this.playersInLobby = Object.keys(gameData.players)
      });
  }

  public checkCachedPlayerID = (): void => {
    this.playerID = localStorage.getItem('player_id');
    if (this.playerID) { this.playerJoin(this.playerID); }
  }

  public playerJoin = (playerID: string): void => {

    // TODO: disable join the game button if input is empty
    this._store.dispatch(new fromStore.SetPlayerId(this.gameID, playerID));
    this.playerID = playerID;
    localStorage.setItem('player_id', playerID);
  }

  public startGame = (): void => {
    this._store.dispatch(new fromStore.StartGame(this.gameID));
  }

  public editPlayerName = (): void => {
    this.isEditingName = true;
  }

  public updatePlayerID = (newUsername: string): void => {
    this.isEditingName = false;
    // make backend call to update userid.
    // IMPORTANT: will not actually update name until endpoint is available
  }

  private _listenErrors = () => {
    this.action$.pipe(
      ofType(GameActions.LOAD_GAME_FAIL)
    )
      .subscribe(resp => {
        console.log(resp);
        this.error = resp.errorMessage;
      });
  }
}
