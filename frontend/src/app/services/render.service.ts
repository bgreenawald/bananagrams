import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RenderService {

  constructor() { }

  public generateID = () => {
    const min = 0;
    const max = 999999;
    let random = Math.floor(Math.random() * (+max - +min)) + +min;
    return random;
  }

}
