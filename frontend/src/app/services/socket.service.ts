import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.backendUrl);
  }

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
  public receive = (): Observable<any> => {
    return new Observable(observer => {
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

  public swapTiles = (gameID: string, tileLetter: string, playerID: string) => {
    this.socket.emit('swap', {
      name: gameID,
      letter: tileLetter,
      player_id: playerID
    });
  }

  public peel = (gameID: string): void => {
    this.socket.emit('peel', {
      name: gameID
    });
  }
}