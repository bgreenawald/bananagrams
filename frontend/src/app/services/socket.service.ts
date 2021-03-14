import { Injectable } from '@angular/core';

import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import * as GameActions from './../store/actions/game.actions';

@Injectable({
  providedIn: 'root'
})

// would like to refactor like this someday? https://github.com/avatsaev/angular-contacts-app-example/blob/875aa2df7f5f87b6731a1259b63e2b399fa5fb3f/src/app/views/contacts/services/contacts-socket.service.ts

// export class SocketService2 extends Socket {
//   constructor() {
//     super({ url: 'http://localhost:3000', options: { origin: '*', transport: ['websocket'] } })
//   }
//   public dispatch(messageType: string, payload: any) {
//     this.emit(messageType, payload);
//   }

//   public subscribeToMessage(messageType: string): Observable<any> {
//     return this.fromEvent(messageType)
//   }
// }


// export class sockService extends Socket {
//   joinGame$ = this.fromEvent<any>(GameActions.JOIN_ROOM)

//   constructor() {
//     super({
//       url: 'https://localhost:3000',
//       options: { origin: '*', transport: ['websocket'] }
//     })
//   }
// }

export class SocketService {
  constructor(
    private socket: Socket
  ) { }

  public disconnect = () => {
    this.socket.disconnect();
  }

  public playerJoin = (gameID: string, username: string): void => {
    this.socket.emit('player_join', {
      name: gameID,
      player_id: username
    });
  }

  public joinRoom = (gameID: string): void => {
    this.socket.emit('join', {
      name: gameID
    });
  }

  public loadOrCreateGame = (gameID: string): void => {
    this.socket.emit('load_game', {
      name: gameID
    });
  }

  public startGame = (gameID: string): void => {
    this.socket.emit('start_game', {
      name: gameID
    });
  }

  // listens and receives all incoming socket messages from the server
  // TODO: why does game loaded fire four times? from here.  But only fires once from the app component?
  public receive = (): Observable<any> => {
    return Observable.create(observer => {
      this.socket.on('render_game', resp => {
        observer.next(resp);
      });
    });
  }

  public reset = (gameID: string): void => {
    this.socket.emit('reset', {
      name: gameID
    });
  }

  public continueGame = (gameID: string): void => {
    this.socket.emit('continue_game', {
      name: gameID,
    });
  }

  public userCallBananagrams = (gameID: string, playerID: string, words: string[]): void => {
    this.socket.emit('bananagrams', {
      name: gameID,
      player_id: playerID,
      words
    });
  }
}
