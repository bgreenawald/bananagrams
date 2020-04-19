
const populateBoard = () => {
  let board = document.getElementById("board");
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      board.innerHTML += `<div class="cell" data-row=${r} data-column=${c}></div>`;
    }
  }

  // Attach the listeners to the grid cells
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener("dragenter", handleDragEnter, options);
    cell.addEventListener("dragleave", handleDragLeave, options);
    cell.addEventListener("dragover", handleDragOver, options);

    cell.addEventListener("dragend", handleDragEndBoard, options);
    cell.addEventListener("drop", handleDrop, options);
  });

  centerBoard();
};

const centerBoard = () => {
  const boardViewport = document.getElementById("board-viewport");
  const board = document.getElementById("board");
  const scrollPositionX = board.offsetLeft + (board.offsetWidth / 2);
  const scrollPositionY = board.offsetTop + (board.offsetHeight / 3);
  boardViewport.scrollLeft = scrollPositionX;
  boardViewport.scrollTop = scrollPositionY;
}

const handleDragEnter = e => {
  e.preventDefault();
  e.target.classList.add("over");
};


const handleDragLeave = e => {
  e.preventDefault();
  e.target.classList.remove("over");
};

let handleDragOver = e => {
  if (e.preventDefault) e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  return false;
};

const handleDragEndBoard = e => {
  e.target.style.opacity = "";
}

const handleDrop = e => {
  e.preventDefault();
  let primaryDestinationCell = e.target;
  primaryDestinationCell.classList.remove("over");
  primaryDestinationCell.classList.add("filled");

  let id = e.dataTransfer.getData('text');
  let primaryTile = document.querySelector(`.tile[data-tile-id="${id}"]`);
  primaryTile.dataset.row = primaryTile.parentElement.dataset.row;
  primaryTile.dataset.column = primaryTile.parentElement.dataset.column;

  e.target.appendChild(primaryTile);
  primaryTile.dataset.destinationRow = primaryDestinationCell.dataset.row;
  primaryTile.dataset.destinationColumn = primaryDestinationCell.dataset.column;

  const rowChange = Number(primaryTile.dataset.destinationRow) - Number(primaryTile.dataset.row);
  const columnChange = Number(primaryTile.dataset.destinationColumn) - Number(primaryTile.dataset.column);
  // calculate new coors for secondary cells. (origins + dist = targets)
  tilesToDrag.forEach(tileData => {
    secondaryTile = document.querySelector(`.tile[data-tile-id="${tileData.id}"]`);
    secondaryTile.dataset.row = secondaryTile.parentElement.dataset.row;
    secondaryTile.dataset.column = secondaryTile.parentElement.dataset.column;

    secondaryTile.dataset.destinationRow = rowChange + Number(secondaryTile.dataset.row);
    secondaryTile.dataset.destinationColumn = columnChange + Number(secondaryTile.dataset.column);

    secondaryTile.dataset.row = secondaryTile.dataset.destinationRow;
    secondaryTile.dataset.column = secondaryTile.dataset.destinationColumn;

    let secondaryDestination = document.querySelector(`#board .cell[data-row="${secondaryTile.dataset.destinationRow}"][data-column="${secondaryTile.dataset.destinationColumn}"]`);
    secondaryDestination.appendChild(secondaryTile);
  })

  primaryTile.dataset.row = primaryTile.dataset.destinationRow;
  primaryTile.dataset.column = primaryTile.dataset.destinationColumn;

  tilesToDrag = [];
  cleanBench();
  resetModifiers('tile');
}

populateBoard();