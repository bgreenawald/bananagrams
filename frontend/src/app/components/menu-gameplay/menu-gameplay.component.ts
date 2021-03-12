import { Component, OnInit } from '@angular/core';

import { Socket } from 'ngx-socket-io';

import { AppComponent } from '../../app.component';
import { ErrorService } from '../../services/error.service';
import { MessageBusService } from '../../services/message-bus.service';
import { SocketService } from '../../services/socket.service';

import * as Models from './../../models';

import { Store, select } from '@ngrx/store';
import * as fromStore from './../../store';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-menu-gameplay',
  templateUrl: './menu-gameplay.component.html',
  styleUrls: ['./menu-gameplay.component.scss']
})
export class MenuGameplayComponent implements OnInit {
  public gameID: string;
  public tilesRemaining: number;
  public playerID: string;

  // private message$ = this.app.getMessages();

  constructor(
    private app: AppComponent,
    private errorService: ErrorService,
    private messageBusService: MessageBusService,
    private socket: Socket,
    private socketService: SocketService,
    private _store: Store<Models.GameState>
  ) { }

  ngOnInit(): void {

    this.listenToStore();
  }

  listenToStore = () => {
    this._store.select(fromStore.getPlayerIDSelector).pipe(take(1)).subscribe(id => this.playerID = id)
    this._store.select(fromStore.selectGameID).pipe(take(1)).subscribe(id => this.gameID = id)
  }

  handleStartNewGame = () => {
    this.messageBusService.openModal("startNewGameConfirm");
  }

  handleReset = () => {
    this.messageBusService.openModal("resetConfirm");
  }

  peel = () => {
    // if (this.isValidBoard()) {
    this.socket.emit("peel", {
      "name": this.gameID
    })
    // }
    // else this.errorService.displayError('To peel, your bench must be empty and your board must be valid.')
  }


  selectAllTiles = () => {
    const tiles: Element[] = Array.from(document.querySelectorAll('#board app-tile'));
    tiles.forEach(tile => {
      tile.classList.add('selected');
    })
  }

  // create call bananagrams action
  bananagrams = () => {
    // if (this.isValidBoard()) {
    const words: string[] = this.getAllWords();
    // this.socket.emit("bananagrams", {
    //   "name": this.gameID,
    //   "player_id": this.playerID,
    //   "words": words
    // })
    this._store.dispatch(new fromStore.CallBananagrams(this.gameID, this.playerID, words))
    // }
    // else this.errorService.displayError('Cannot call bananagrams.  Board is invalid.')
  }

  continueGame = () => {
    this.socket.emit("continue_game", {
      "name": this.gameID
    })
  }

  isValidBoard = () => {
    let board = document.querySelector('#board');
    let bench = document.getElementById('bench')

    const benchTiles = Array.from(document.querySelectorAll('#bench app-tile'));

    // Make sure the bench is empty
    if (benchTiles.length > 0) {
      return false;
    }

    // Using a queue, process each tile and make sure we can get to every tile
    let processTiles = Array.from(document.querySelectorAll('app-tile'));
    let seenTiles = [];

    while (processTiles.length > 0) {
      let currentTile = processTiles.pop();

      if (!seenTiles.includes(currentTile)) {
        seenTiles.push(currentTile);
      }

      let neighborTiles = Array.from(this.getTileNeighbors(currentTile))
      neighborTiles.forEach(neighborTile => {
        if (!seenTiles.includes(neighborTile)) {
          processTiles.push(neighborTile);
        }
      })
    }
    // If we hit every tile, then we have a valid board

    let allTiles = board.querySelectorAll("app-tile");
    console.log(seenTiles)
    console.log(allTiles)
    return seenTiles.length === allTiles.length;
  }

  getTileNeighbors = (tile): any[] => {
    let neighbors = [];
    const parentCell = tile.parentElement;
    let tileRow = parseInt(parentCell.getAttribute("data-row"));
    let tileColumn = parseInt(parentCell.getAttribute("data-column"));
    var board = document.querySelector("#board");

    const neighborIndices = [
      { row: tileRow - 1, column: tileColumn },
      { row: tileRow + 1, column: tileColumn },
      { row: tileRow, column: tileColumn + 1 },
      { row: tileRow, column: tileColumn - 1 }
    ]

    neighborIndices.forEach(neighbor => {
      const neighborTile = board.querySelector(`app-cell[data-row="${neighbor.row}"][data-column="${neighbor.column}"] app-tile`);
      if (neighborTile) neighbors.push(neighborTile);
    });

    return neighbors;
  }

  getAllWords = (): string[] => {
    let allWords = [];

    const [minRow, maxRow, minColumn, maxColumn] = this.findFilledArea();

    // Get all words row wise
    for (let r = minRow; r <= maxRow; r++) {
      let curWord = "";
      for (let c = minColumn; c <= maxColumn + 1; c++) {
        var curTile = document.querySelectorAll(`#board app-cell[data-row="${r}"][data-column="${c}"] .tile`);

        if (curTile.length > 0) {
          curWord += curTile[0].textContent;
        } else {
          if (curWord.length > 1) {
            allWords.push(curWord);
          }
          curWord = "";
        }
      }
    }

    // Get all column wise
    for (let c = minColumn; c <= maxColumn; c++) {
      let curWord = "";
      for (let r = minRow; r <= maxRow + 1; r++) {
        var curCell = document.querySelectorAll(`#board app-cell[data-row="${r}"][data-column="${c}"]`)[0];
        if (curCell.children.length > 0) {
          curWord += curCell.querySelector('.tile').textContent;
        } else {
          if (curWord.length > 1) {
            allWords.push(curWord);
          }
          curWord = "";
        }
      }
    }
    return allWords;
  }

  findFilledArea = (): number[] => {
    let allTiles: any[] = Array.from(document.querySelectorAll('#board app-tile'));
    let occupiedColumns = allTiles.map((tile: any) => tile.parentElement.dataset.column);
    let occupiedRows = allTiles.map((tile: any) => tile.parentElement.dataset.row);


    const minRow = Math.min(...occupiedRows);
    const maxRow = Math.max(...occupiedRows);
    const minColumn = Math.min(...occupiedColumns);
    const maxColumn = Math.max(...occupiedColumns);

    return [minRow, maxRow, minColumn, maxColumn];
  }

  // socketSubscribe = () => {
  //   this.message$.
  //     subscribe(value => {
  //       if (value.data.tiles_remaining) {
  //         this.tilesRemaining = value.data.tiles_remaining
  //       }
  //     },
  //       err => this.errorService.parseError(err)
  //     )
  // }
}