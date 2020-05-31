import { Injectable, TemplateRef } from '@angular/core';
import { HelperService } from './helper.service';
import { ErrorService } from './error.service';
import { Subject } from "rxjs";
import { AppRoutingModule } from '../app-routing.module';
import { TileComponent } from '../components/tile/tile.component';
import { MessageBusService } from '../services/message-bus.service';

@Injectable({
  providedIn: 'root'
})
export class EventHandleService {
  // HTMLElement is of type app-tile
  public selectedTiles: HTMLElement[] = [];
  public tilesToDrag = [];
  private _emptyCellColumns: number[] = [];
  private _removeCells = new Subject();
  public removeCell$ = this._removeCells.asObservable();

  constructor(
    private errorService: ErrorService,
    private helperService: HelperService,
    private _messageBusService: MessageBusService
  ) { }

  handleClick = (e, appTile?) => {
    e.preventDefault();
    let tile = this.getTile(e.target, appTile);

    this.errorService.clearError();
    this.toggleSelectedClass(tile);
  }

  getTile = (targetElement, appTile) => {
    let tile;
    if (targetElement.tagName === "APP-TILE") {
      tile = targetElement
    }
    else if (appTile) {
      tile = appTile
    }
    return tile;
  }

  toggleSelectedClass = (tile: HTMLElement) => {
    if (!!tile) {
      let classes = tile.classList;
      if (classes.contains('selected')) {
        classes.remove('selected')
      }
      else {
        classes.add('selected');
      }
    }
  }

  handleDragStart = (e) => {
    const currentTile = e.target;
    if (!this.selectedTiles.includes(currentTile)) {
      // dataset.tileId is casing is determined by the DOM.
      const tileID = e.target.dataset.tileId;
      const tile = document.querySelector(`app-tile[data-tile-id='${tileID}']`)
      tile.classList.add("selected")
    }

    e.target.style.cursor = "grabbing";
    e.dataTransfer.dropEffect = "copy";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text", e.target.dataset.tileId);
  };

  handleDragEnd = e => {
    e.preventDefault();
    this.selectedTiles.forEach(tile => {
      tile.classList.remove('selected')
    })
    this.selectedTiles = [];
  }

  handleDoubleClick = e => {
    e.preventDefault();
    return false;
  }

  handleDragEnter = e => {
    e.preventDefault();
    if (e.target.children.length === 0) {
      e.target.classList.add("over");
    }

  };

  handleDragLeave = e => {
    e.preventDefault();
    if (e.target.classList.contains("over")) {
      e.target.classList.remove("over");
    }
  };

  handleDragOver = e => {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    return false;
  };

  handleOnMouseDown = e => {
    if (e.preventDefault) e.preventDefault();
    return false;
  }

  handleSwap = (activeTileID: number, tilesArray: string[]) => {
    const tileToRemove = document.querySelector(`.tile[data-tile-id="${activeTileID}"]`).parentElement;
    const parentCell = tileToRemove.parentNode;
    const letter = tileToRemove.children[0].textContent;

    tileToRemove.parentNode.removeChild(tileToRemove);
    parentCell.parentNode.removeChild(parentCell);

    return letter;
  }

  clearSelectedTiles = () => {
    const selectedTiles = Array.from(document.querySelectorAll('app-tile.selected'));
    selectedTiles.forEach(tile => {
      tile.classList.remove('selected')
    })
  }

  handleDrop = e => {
    e.preventDefault();

    let cellsToClear: number[]; // array with the identifying column numbers of the cells to delete
    let primaryDestinationCell = e.target;

    // Get the tile ID and handle the null case
    let id = e.dataTransfer.getData('text');

    if (id === null || id.trim() === "") {
      if (primaryDestinationCell.classList.contains("over")) {
        primaryDestinationCell.classList.remove("over");
      }
      return;
    }

    let primaryTile = document.querySelector(`app-tile[data-tile-id="${id}"]`);
    const [rowChange, columnChange] = this.calculateDistanceChange(primaryTile, primaryDestinationCell);

    //move additional cells 
    const selectedTiles = Array.from(document.querySelectorAll('app-tile.selected'));
    if (selectedTiles.length > 0) {
      selectedTiles.forEach((tile, i) => {
        this.moveTile(tile, rowChange, columnChange);
      })
    }

    this.tilesToDrag = [];
    this.clearSelectedTiles();
    this._removeCells.next(this._emptyCellColumns)
    this._emptyCellColumns = [];
    primaryDestinationCell.classList.remove("over");
  }


  calculateDistanceChange = (primaryTile, primaryDestinationCell) => {
    let sourceRow = Number(primaryTile.parentElement.dataset.row);
    let sourceColumn = Number(primaryTile.parentElement.dataset.column);


    let destinationRow = Number(primaryDestinationCell.dataset.row);
    let destinationColumn = Number(primaryDestinationCell.dataset.column);

    const rowChange = destinationRow - sourceRow;
    const columnChange = destinationColumn - sourceColumn;

    return [rowChange, columnChange];
  }

  moveTile = (tile, rowChange, columnChange) => {
    const tileID = tile.dataset.tileId;
    const currentTile = document.querySelector(`app-tile[data-tile-id="${tileID}"]`);
    const letter = currentTile.querySelector('span').textContent;

    const newChildTile = {
      id: tileID,
      letter: letter
    }

    // tile is of type app-tile
    const parentCell = tile.parentElement;
    let sourceRow = Number(parentCell.dataset.row);
    let sourceColumn = Number(parentCell.dataset.column);

    let destinationRow = rowChange + sourceRow;
    let destinationColumn = columnChange + sourceColumn;

    let secondaryDestination = document.querySelector(
      `#board app-cell[data-row="${destinationRow}"][data-column="${destinationColumn}"]`
    );
    const destinationCell = {
      row: destinationRow,
      column: destinationColumn
    };

    // if desired target cell has no tile in it already 
    if (secondaryDestination.children.length === 0) {
      this._messageBusService.addChildTile(
        newChildTile, destinationCell);
      // if bench cell, remove
      if (parentCell.parentElement.id === "bench") {
        this._emptyCellColumns.push(Number(parentCell.dataset.column))
      }
      // else, clear child tile
      else {
        this._messageBusService.removeChildTile({
          row: sourceRow,
          column: sourceColumn
        })
      }
      secondaryDestination.classList.add("filled");
      tile.dataset.row = destinationRow;
      tile.dataset.column = destinationColumn;
    }
  }
}