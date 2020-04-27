import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Socket } from 'ngx-socket-io';

import { Observable, of, fromEvent } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


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

  constructor(
    private socket: Socket,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.socketReceive();
    this.socketInit();
  }

  socketInit = (): void => {
    const id = +this.route.snapshot.paramMap.get('id');
    this.gameID = id.toString();

    this.socket.on("connect", _ => {
      this.socket.emit("join", {
        "name": this.gameID
      })
      this.socket.emit("load_game", {
        "name": this.gameID
      })
    })
  }

  socketReceive = (): void => {
    this.socket.on("render_game", resp => {
      console.log(resp.status_code, resp.message, JSON.parse(resp.payload));
      let data = JSON.parse(resp.payload);
      if (data.players) {
        for (let user in data.players) {
          this.playersInLobby.push(user)
        }
      }

      if (resp.message === "Game loaded.") {
        this.router.navigate([`/game/${this.gameID}`]);
      }
    })
  }

  playerJoin = (playerID: string): void => {
    if (!playerID) return; //if the id input is empty, stop function execution here. 

    this.playerID = playerID;
    localStorage.setItem("player_id", playerID.toString());

    this.socket.emit("player_join", {
      "name": this.gameID,
      "player_id": this.playerID
    })
  }

  startGame = (): void => {
    this.socket.emit("state_game", {
      "name": this.gameID
    })
  }
}
