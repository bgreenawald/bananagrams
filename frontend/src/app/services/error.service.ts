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
    const errorElement = document.querySelector('.error-content');
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  clearError = () => {
    const errorElement = document.querySelector('.error-content');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }
}