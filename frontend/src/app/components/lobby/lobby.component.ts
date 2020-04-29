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

  }

  playerJoin = (playerID: string): void => {

    if (!playerID) return; //if the id input is empty, stop function execution here. 

    this.playerID = playerID;
    localStorage.setItem("player_id", playerID.toString());

  }

  startGame = (): void => {

  }

  setGameID = () => {
    this.gameID = this.route.snapshot.paramMap.get("id");
  }
}
