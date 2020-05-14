import { Injectable } from '@angular/core';

import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor(
    private socket: Socket
  ) { }

  playerJoin = (gameID: string, username: string) => {
    this.socket.emit("player_join", {
      "name": gameID,
      "player_id": username
    })
  }

  loadOrCreateGame = (gameID: string) => {
    this.socket.emit("load_game", {
      "name": gameID
    })
    this.socket.emit("join", {
      "name": gameID
    })
  }

  receive = (): Observable<any> => {
    return Observable.create(observer => {
      this.socket.on("render_game", resp => {
        observer.next(resp)
      })
    })
  }
}
