import { Injectable } from '@angular/core';

import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public gameID: string; // numerical game id formatted as a string

  constructor(
    private socket: Socket
  ) { }

  socketInit = (gameID: string): void => {
    console.log('connecting game id', gameID)
    this.gameID = gameID;

    this.socket.on("connect", () => {
      this.socket.emit("join", {
        "name": this.gameID
      })
    });
    this.socket.emit("load_game", {
      "name": this.gameID
    });
  }

  socketReceive = (): void => {
    this.socket.on("render_game", response => {
      return response;
    })
  }
}
