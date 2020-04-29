import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Socket } from 'ngx-socket-io';

import { Observable, of, fromEvent } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { SocketService } from '../../services/socket.service';


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
    private router: Router,
    private socketService: SocketService
  ) { }
  ngOnInit(): void {
    this.setGameID();

    // use socket.io to join the room with respective gameID/roomID
    this.socket.emit("join", {
      "name": this.gameID
    })
    this.socket.emit("load_game", {
      "name": this.gameID
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
    // this.socketService.socketSend(this.gameID, "player_join")
  }

  startGame = (): void => {
    this.socket.emit("start_game", {
      "name": this.gameID
    })
  }

  setGameID = () => {
    this.gameID = this.route.snapshot.paramMap.get("id");
  }
}
