import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Socket } from 'ngx-socket-io';

import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';

import { SocketService } from '../../services/socket.service';
import { ErrorService } from '../../services/error.service';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  public gameID: string; // numerical game id formatted as a string
  public playerJoined: boolean = false;
  public playerID: string = this.app.playerID;
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
  ) { }

  ngOnInit(): void {
    this.setGameID();
    this.socketSubscribe();
    this.socketService.loadOrCreateGame(this.gameID);
    this.autoJoin();
  }

  autoJoin = () => {
    console.log(this.playerID)
    if (this.playerID) this.playerJoin(this.playerID);
  }

  playerJoin = (playerID: string): void => {
    if (!playerID) return; //if the id input is empty, stop function execution here. 
    // TODO: disable join the game button if input is empty

    this.playerID = playerID;
    localStorage.setItem("player_id", playerID.toString());

    this.socketService.playerJoin(this.gameID, this.playerID);
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
        console.log(value)
        if (value.data.players) {
          this.playersInLobby = [];
          for (let player in value.data.players) {
            this.playersInLobby.push(player)
          }
        }
        if (value.message === "Game started") {
          this.router.navigate([`/game/${this.gameID}`])
        }
      },
        err => this.error = this.errorService.parseError(err)
      )
  }
}
