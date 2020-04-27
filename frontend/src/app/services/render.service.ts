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

  private _createTiles = (lettersArray) => {
    let tilesArray = [];
    // Array.prototype.forEach.call(lettersArray, function (letter, index) {
    //     tilesArray.push(`<div class="cell" data-row="0" data-column="${index}"><span class="tile" data-tile-id="${numberOfTiles}" draggable="true">${letter}</span></div>`);
    //     numberOfTiles += 1;
    // });

    return tilesArray;
  };

}
