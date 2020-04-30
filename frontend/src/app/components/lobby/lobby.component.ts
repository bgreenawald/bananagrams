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
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private socketService: SocketService
  ) { }
  ngOnInit(): void {
    this.setGameID();
    this.socketSubscribe();
    this.socketService.loadOrCreateGame(this.gameID);
  }

  playerJoin = (playerID: string): void => {
    if (!playerID) return; //if the id input is empty, stop function execution here. 
    // TODO: disable join the game button if input is empty

    this.playerID = playerID;
    localStorage.setItem("player_id", playerID.toString());

    this.socketService.playerJoin(this.gameID, this.playerID);
  }

  startGame = (): void => {

  }

  setGameID = () => {
    const id = this.route.snapshot.paramMap.get('id');
    this.gameID = id;
  }

  socketSubscribe = () => {
    this.socketService.receive()
      .subscribe(resp => {
        let payload = JSON.parse(resp.payload);
        if (payload.players) {
          for (let player in payload.players) {
            this.playersInLobby.push(player)
          }
        }
      })
  }
}
