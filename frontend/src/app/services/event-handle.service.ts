import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventHandleService {

  constructor() { }

  handleClick = e => {
    e.preventDefault();
    let classes = e.target.classList;
    classes.contains('selected') ? classes.remove('selected') : classes.add('selected');
  }

  handleDragStart = e => {
    e.target.style.opacity = .4;
    if (!e.target.classList.contains('selected')) {
      e.target.classList.add("selected")
    };
    let selectedTiles = Array.from(document.querySelectorAll('.selected'));
    // casing of tileId is set by browser parsing
    // tilesToDrag = selectedTiles.map(tile => {
    //     let tileData = {
    //         id: tile.dataset.tileId,
    //         row: tile.parentElement.dataset.row,
    //         column: tile.parentElement.dataset.column
    //     }
    //     return tileData
    // });
    e.target.style.cursor = "grabbing";
    e.dataTransfer.dropEffect = "copy";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text", e.target.dataset.tileId);
  };

  handleDragEnd = e => {
    e.target.style.opacity = "";
  }

  handleDoubleClick = e => {
    e.preventDefault();
    // menu.setAttribute("active-tile-id", e.target.getAttribute("data-tile-id"))
    // // Set the position for the menu
    // const origin = {
    //   left: e.pageX,
    //   top: e.pageY
    // };
    // setPosition(origin);
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
    let sourceRow = primaryTile.parentElement.dataset.row;
    let sourceColumn = primaryTile.parentElement.dataset.column;

    let destinationRow = primaryDestinationCell.dataset.row;
    let destinationColumn = primaryDestinationCell.dataset.column;

    const rowChange = Number(destinationRow) - Number(sourceRow);
    const columnChange = Number(destinationColumn) - Number(sourceColumn);

    var queueLength = null;

    // Continuously try and move tiles one by one until no progress is made.
    // while (queueLength != tilesToDrag.length) {
    //     queueLength = tilesToDrag.length;
    //     for (var i = 0; i < queueLength; i += 1) {
    //         var tileData = tilesToDrag.shift();
    //         secondaryTile = document.querySelector(`.tile[data-tile-id="${tileData.id}"]`);
    //         sourceRow = secondaryTile.parentElement.dataset.row;
    //         sourceColumn = secondaryTile.parentElement.dataset.column;

    //         destinationRow = rowChange + Number(sourceRow);
    //         destinationColumn = columnChange + Number(sourceColumn);

    //         let secondaryDestination = document.querySelector(
    //             `#board .cell[data-row="${destinationRow}"][data-column="${destinationColumn}"]`
    //         );
    //         if (secondaryDestination.children.length > 0) {
    //             tilesToDrag.push(tileData);
    //         } else {
    //             secondaryDestination.appendChild(secondaryTile);
    //             primaryDestinationCell.classList.remove("over");
    //             primaryDestinationCell.classList.add("filled");
    //             secondaryTile.dataset.row = destinationRow;
    //             secondaryTile.dataset.column = destinationColumn;
    //         }
    //     }
    // }
    // tilesToDrag = [];
    // cleanBench();
    // resetModifiers('tile');
  }

}
