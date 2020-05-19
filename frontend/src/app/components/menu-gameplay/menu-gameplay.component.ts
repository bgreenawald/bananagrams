import { Component, OnInit } from '@angular/core';

import { Socket } from 'ngx-socket-io';

import { AppComponent } from '../../app.component';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-menu-gameplay',
  templateUrl: './menu-gameplay.component.html',
  styleUrls: ['./menu-gameplay.component.scss']
})
export class MenuGameplayComponent implements OnInit {
  gameID: string = this.app.getGameID();
  playerID: string = this.app.getPlayerID();

  constructor(
    private app: AppComponent,
    private errorService: ErrorService,
    private socket: Socket
  ) { }

  ngOnInit(): void {
    console.log(this.app.getGameID())
  }

  reset = () => {
    // refresh the page would work the same??
    this.socket.emit("reset", {
      "name": this.gameID
    });
  }

  peel = () => {
    if (this.isValidBoard()) {
      this.socket.emit("peel", {
        "name": this.gameID
      })
    }
    else this.errorService.displayError('cannot peel')
  }


  selectAllTiles = () => {

  }

  bananagrams = () => {
    if (this.isValidBoard()) {
      this.socket.emit("banangrams", {
        "name": this.gameID,
        "player_id": this.playerID,
        // "words": words
      })
    }
    else this.errorService.displayError('cannot call bananagrams')
  }

  continueGame = () => {
    this.socket.emit("continue_game", {
      "name": this.gameID
    })
  }

  isValidBoard = () => {
    let board = document.querySelector('#board');
    let bench = document.getElementById('bench')

    const benchTiles = Array.from(document.querySelectorAll('#bench .tile'));

    // Make sure the bench is empty
    if (benchTiles.length > 0) {
      return false;
    }

    // Using a queue, process each tile and make sure we can get to every tile
    let processTiles = [document.querySelector('.tile')];
    let seenTiles = [];

    // Refactor? !!processTiles
    while (processTiles.length > 0) {
      let currentTile = processTiles.pop();

      if (!seenTiles.includes(currentTile)) {
        seenTiles.push(currentTile);
      }

      let neighborTiles = Array.from(this.getTileNeighbors(currentTile))
      neighborTiles.forEach(neighbor => {
        if (neighbor.children.length > 0) {
          let childTile = neighbor.children[0];

          if (!seenTiles.includes(childTile)) {
            processTiles.push(childTile);
          }

        }
      })
    }
    // If we hit every tile, then we have a valid board
    console.log(`Seen tiles ${seenTiles.length}`);
    console.log(`All tiles ${board.querySelectorAll(".tile").length}`);

    let allTiles = board.querySelectorAll(".tile");
    return seenTiles.length === allTiles.length;
  }

  getTileNeighbors = (tile) => {
    let neighbors = [];
    let tileRow = parseInt(tile.getAttribute("data-row"));
    let tileColumn = parseInt(tile.getAttribute("data-column"));
    var board = document.querySelector("#board");

    // Based on the row and column values, get the appropriate neighbors

    neighbors.push(board.querySelectorAll(`.cell[data-row="${tileRow - 1}"][data-column="${tileColumn}"]`)[0])
    neighbors.push(board.querySelectorAll(`.cell[data-row="${tileRow + 1}"][data-column="${tileColumn}"]`)[0])

    neighbors.push(board.querySelectorAll(`.cell[data-row="${tileRow}"][data-column="${tileColumn - 1}"]`)[0])
    neighbors.push(board.querySelectorAll(`.cell[data-row="${tileRow}"][data-column="${tileColumn + 1}"]`)[0])


    return neighbors;
  }
}