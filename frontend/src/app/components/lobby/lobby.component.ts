import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Socket } from 'ngx-socket-io';

import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';

import { SocketService } from '../../services/socket.service';
import { ErrorService } from '../../services/error.service';
import { AppComponent } from '../../app.component';

import * as Selectors from '../../store/selectors';

import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';



import * as Models from './../../models';

import { Store, select } from '@ngrx/store';
import * as fromStore from './../../store';
import { take } from 'rxjs/operators';

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
    private _store: Store<Models.GameState>
  ) { }

  ngOnInit(): void {
    this.socketSubscribe();
    this.listenToStore();  // probably need to destroy this??
  }

  listenToStore = () => {
    this._store.pipe(select(fromStore.getPlayerIDSelector)).subscribe(id => {
      this.playerID = id;
      // this.autoJoin();
    })
    this._store.pipe(select(fromStore.selectGameID)).subscribe(gameID => {
      console.log(gameID)
      this.gameID = gameID;
      this._store.dispatch(new fromStore.LoadOrCreateGame(gameID));
    });
    this._store.pipe(select(fromStore.getGameDataSelector)).subscribe(gameData => this.playersInLobby = gameData.players)
  }

  autoJoin = () => {
    if (this.playerID) this.playerJoin(this.playerID);
  }

  playerJoin = (playerID: string): void => {
    if (!playerID) return;
    // TODO: disable join the game button if input is empty

    this._store.dispatch(new fromStore.SetPlayerId(playerID));
    localStorage.setItem("player_id", playerID);

    // this.socketService.playerJoin(this.gameID, playerID);
  }

  startGame = (): void => {
    this.socket.emit("start_game", {
      "name": this.gameID
    })
  }

  // TODO: refactor
  socketSubscribe = () => {
    this.messages$
      .subscribe(value => {
        if (value.data.players) {
          this.playersInLobby = [];
          for (let player in value.data.players) {
            this.playersInLobby.push(player)
          }
        }
      },
        // err => this.error = this.errorService.parseError(err)
        err => console.log("ERROR", err)
      )
  }
}
