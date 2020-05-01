import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Socket } from 'ngx-socket-io';

import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';

import { SocketService } from '../../services/socket.service';
import { Response } from 'selenium-webdriver/http';


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
  private messages$ = this.socketService.receive();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private socketService: SocketService,
  ) { }
  ngOnInit(): void {
    this.setPlayerID();
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
    this.socket.emit("start_game", {
      "name": this.gameID
    })
  }

  setGameID = () => {
    const id = this.route.snapshot.paramMap.get('id');
    this.gameID = id;
  }

  setPlayerID = () => {
    this.playerID = localStorage.getItem("player_id");
  }

  socketSubscribe = () => {
    this.messages$.pipe(
      map(resp => {
        if (resp.status_code !== 200) throw `error: ${resp.message}`
        const value = {
          ...resp,
          "data": JSON.parse(resp.payload)
        };
        return value;
      }
      ),
      catchError(errorMessage => throwError(errorMessage))
    )
      .subscribe(value => {
        console.log(value)
        if (value.data.players) {
          this.playersInLobby = [];
          for (let player in value.data.players) {
            this.playersInLobby.push(player)
          }
        }
      },
        err => this.error = err
      )
  }
}
