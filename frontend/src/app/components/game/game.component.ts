import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Socket } from 'ngx-socket-io';

import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';

import { ErrorService } from '../../services/error.service';
import { SocketService } from '../../services/socket.service';

import { AppComponent } from '../../app.component';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements OnInit {
  public allTiles: string[];
  public error: string;
  public gameID: string; // numerical game id formatted as a string
  public playerJoined: boolean = false;
  public playerID: string = this.app.getPlayerID();
  public tiles: string[];

  private messages$ = this.app.getMessages();

  constructor(
    private app: AppComponent,
    private route: ActivatedRoute,
    private socket: Socket,
    private errorService: ErrorService,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this._getPlayerID();
    this._getUserLetters();
    this.setGameID();
    this.socketSubscribe();
    this.socketService.loadOrCreateGame(this.gameID);
  }

  setGameID = () => {
    const id = +this.route.snapshot.paramMap.get('id');
    this.gameID = id.toString();
  }

  _getPlayerID = () => {
    this.playerID = localStorage.getItem("player_id")
    console.log(this.playerID)
  }

  // TODO: refactor
  socketSubscribe = () => {
    this.messages$
      .subscribe(value => {
        console.log(value.data.players)
        console.log(this.playerID)
        this.tiles = value.data.players[this.playerID]
      },
        err => this.error = this.errorService.parseError(err)
      )
  }

  private _getUserLetters = () => {
    this.allTiles = JSON.parse(localStorage.getItem("players"));
    for (let player in this.allTiles) {
      if (player === this.playerID) {
        console.log(this.allTiles)
        return this.allTiles[this.playerID];
      }
    }
  }
}
