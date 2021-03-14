import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  parseError(err: string) {
    switch (err) {
      case 'error: Cannot start game, game state is State.ACTIVE. Should be \'IDLE\'':
        return 'This game is already underway!  Wait until it\'s over to join!';
      // TODO: if error is not empty, send back error
      default:
        return 'Error found!';
    }
  }

  displayError(message: string) {
    document.querySelector('.error-content').textContent = message;
  }

  clearError = () => {
    document.querySelector('.error-content').textContent = '';
  }
}
