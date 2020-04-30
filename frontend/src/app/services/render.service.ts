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

  getUserLetters = () => {
    const username = localStorage.getItem("player_id");
    const allTiles = JSON.parse(localStorage.getItem("players"));
    // for (player in allTiles) {
    //   if (player === username) {
    //     return allTiles[username];
    //   }
    // }
  }

  createTiles = (lettersArray) => {
    let tilesArray = [];
    Array.prototype.forEach.call(lettersArray, function (letter, index) {
      // tilesArray.push(`<div class="cell" data-row="0" data-column="${index}"><span class="tile" data-tile-id="${numberOfTiles}" draggable="true">${letter}</span></div>`);
      // numberOfTiles += 1;
    });

    return tilesArray;
  };


  fillCells = (parentId, childrenArrayOrCellNumber) => {
    const parent = document.getElementById(parentId);
    if (typeof (childrenArrayOrCellNumber) === "number") {
      let num = childrenArrayOrCellNumber;
      for (let i = 0; i < num; i++) {
        parent.innerHTML += `<div class="cell"></div>`;
      }
    } else if (Array.isArray(childrenArrayOrCellNumber)) {
      // children.forEach(child => {
      //   parent.innerHTML += child;
      // })
    }
  }

  populate = (parentid, childrenArray) => {
    const parent = document.getElementById(parentid);
    childrenArray.forEach(child => {
      parent.innerHTML += child;
    })
  }

  selectAllTiles = () => {
    var board = document.querySelector("#board");
    Array.from(document.querySelectorAll('.tile')).forEach(tile => {
      if (board.contains(tile)) {
        tile.classList.add('selected')
      }
    })
  }

}
