import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  parseError(err: string) {
    switch (err) {
      case "error: Cannot start game, game state is State.ACTIVE. Should be 'IDLE'":
        return "This game is already underway!  Wait until it's over to join!"
      default:
        return "Error found.  Please reload."
    }
  }
}