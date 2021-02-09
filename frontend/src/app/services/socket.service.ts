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
    console.log('player joining')
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

  // listens and receives all incoming socket messages from the server
  // TODO: why does game loaded fire four times? from here.  But only fires once from the app component?
  receive = (): Observable<any> => {
    return Observable.create(observer => {
      this.socket.on("render_game", resp => {
        observer.next(resp)
      })
    })
  }

  reset = (gameID: string) => {
    this.socket.emit("reset", {
      "name": gameID
    });
  }

  continueGame = (gameID: string) => {
    this.socket.emit("continue_game", {
      "name": gameID,
    })
  }

  userCallBananagrams = (gameID: string, playerID: string, words: string[]) => {
    this.socket.emit("bananagrams", {
      "name": gameID,
      "player_id": playerID,
      "words": words
    })
  }
}
