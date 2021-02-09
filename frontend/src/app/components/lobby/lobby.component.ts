import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Socket } from 'ngx-socket-io';

import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';

import { SocketService } from '../../services/socket.service';
import { ErrorService } from '../../services/error.service';
import { AppComponent } from '../../app.component';


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
    this.setGameID();
    this.socketSubscribe();
    this.socketService.loadOrCreateGame(this.gameID);
  }

  listenToStore = () => {
    this._store.select(fromStore.getPlayerIDSelector).subscribe(id => {
      console.log(id)
      this.playerID = id;
      this.autoJoin();
    })
    this._store.select(fromStore.getGameIDSelector).pipe(take(1)).subscribe(id => this.gameID = id)
  }

  autoJoin = () => {
    console.log(this.playerID)
    if (this.playerID) this.playerJoin(this.playerID);
  }

  playerJoin = (playerID: string): void => {
    if (!playerID) return; //if the id input is empty, stop function execution here. 
    // TODO: disable join the game button if input is empty

    this._store.dispatch(new fromStore.SetPlayerId(playerID));
    localStorage.setItem("player_id", playerID.toString());

    // this.socketService.playerJoin(this.gameID, playerID);
  }

  startGame = (): void => {
    this.socket.emit("start_game", {
      "name": this.gameID
    })
  }

  setGameID = () => {
    const id = this.route.snapshot.paramMap.get('id');
    this.gameID = id;
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
        err => console.log(err)
      )
  }
}
