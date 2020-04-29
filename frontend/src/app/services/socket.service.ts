import { Injectable } from '@angular/core';

import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public gameID: string; // numerical game id formatted as a string

  constructor(
    private socket: Socket
  ) { }

  socketInit = (gameID: string): void => {
    this.gameID = gameID;
    console.log('initializating socket with', this.gameID)

    this.socket.on("connect", () => {
      this.socket.emit("join", {
        "name": this.gameID
      });
      // this.socket.emit("load_game", {
      //   "name": this.gameID
      // });
      this.socketReceive();
    });
  }

  socketSend = (gameID, message) => {
    this.socket.emit(message, {
      "name": gameID
    })
  }

  socketReceive = () => {
    return Observable.create((observer) => {
      this.socket.on("game", message => {
        observer.next(message)
      })
    })
  }
}
