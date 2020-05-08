import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventHandleService {

  public selectedTiles = [];
  public tilesToDrag = [];

  constructor() { }

  handleClick = e => {
    e.preventDefault();
    let classes = e.target.classList;
    if (classes.contains('selected')) {
      classes.remove('selected')
    }
    else {
      classes.add('selected');
      this.selectedTiles.push(e.target)
    }
    console.log('selected tiles', this.selectedTiles)
  }

  handleDragStart = (e, selectedTiles) => {
    // e.target.style.opacity = .4;
    // if (!e.target.classList.contains('selected')) {
    e.target.classList.add("selected")
    this.selectedTiles.push(e.target)

    // };
    // e.target.classList.contains('selected') ? e.target.classList.remove('selected') : e.target.classList.add('selected')
    // let selectedTiles = Array.from(document.querySelectorAll('.selected'));
    // casing of tileId is set by browser parsing
    this.tilesToDrag = this.selectedTiles.map(tile => {
      const tileData = {
        id: tile.dataset.tileId,
        row: tile.parentElement.parentElement.dataset.row || 0,
        column: tile.parentElement.parentElement.dataset.column || 0
      }
      return tileData
    });
    console.log('tiles to drag', this.tilesToDrag)
    e.target.style.cursor = "grabbing";
    e.dataTransfer.dropEffect = "copy";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text", e.target.dataset.tileId);
  };

  handleDragEnd = e => {
    e.preventDefault();
    // e.target.style.opacity = "1";
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

  handleDrop = e => {
    e.preventDefault();

    let primaryDestinationCell = e.target;

    // Get the tile ID and handle the null case
    let id = e.dataTransfer.getData('text');

    if (id === null || id.trim() === "") {
      if (primaryDestinationCell.classList.contains("over")) {
        primaryDestinationCell.classList.remove("over");
      }
      return;
    }

    let primaryTile = document.querySelector(`.tile[data-tile-id="${id}"]`);
    console.log(primaryTile.parentElement.parentElement.dataset)
    let sourceRow = Number(primaryTile.parentElement.parentElement.dataset.row);
    let sourceColumn = Number(primaryTile.parentElement.parentElement.dataset.column);


    let destinationRow = Number(primaryDestinationCell.dataset.row);
    let destinationColumn = Number(primaryDestinationCell.dataset.column);

    const rowChange = destinationRow - sourceRow;
    const columnChange = destinationColumn - sourceColumn;


    //move additional cells 
    if (this.selectedTiles.length > 0) {
      this.selectedTiles.forEach((tile, i) => {
        let sourceRow = Number(tile.parentElement.parentElement.dataset.row);
        let sourceColumn = Number(tile.parentElement.parentElement.dataset.column);

        let destinationRow = rowChange + sourceRow;
        let destinationColumn = columnChange + sourceColumn;

        let secondaryDestination = document.querySelector(
          `#board .cell[data-row="${destinationRow}"][data-column="${destinationColumn}"]`
        );

        if (secondaryDestination.children.length === 0) {

          secondaryDestination.appendChild(tile);
          secondaryDestination.classList.add("filled");
          tile.dataset.row = destinationRow;
          tile.dataset.column = destinationColumn;
        }
      })
    }
    this.tilesToDrag = [];
    this.clearSelectedTiles();
    primaryDestinationCell.classList.remove("over")
  }

  clearSelectedTiles = () => {
    this.selectedTiles.forEach(tile => {
      tile.classList.remove('selected')
    })
  }

}
