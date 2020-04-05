console.log('hello world')

let lettersArray = [];
let grabbedTile = null;
let targetCell = null;
let originCell = null;

const options = false;

const getLetters = () =>  {
  const randomLettersStr = "HvOPidkQaB";

  return randomLettersStr.toUpperCase().split("");
}

const renderBoard = () => {
  const tilesArray = createTiles();
  populateBoardCells(200);
  populate("bench", tilesArray)
}

const createTiles = () => {
  const lettersArray = getLetters();
  const tilesArray =  lettersArray.map((letter, index) => {
    return `<span class="tile" data-tile-id="${index}" draggable="true">${letter}</span>`;
  });
  
  return tilesArray;
};

const populateBoardCells = (num) => {
  let board = document.getElementById("board");
  for (let i = 0; i < num; i++) {
    board.innerHTML += `<div class="cell"></div>`;
  }
};

const populate = (parentid, childrenArray) => {
  const parent=document.getElementById(parentid);
  childrenArray.forEach(child => {
    parent.innerHTML += child;
  })
}

renderBoard();

const handleDragStart = (e) => {
  console.log(`${e.type}`);
  console.log('event', e)
  e.target.style.opacity = 0.4;
  e.target.style.cursor = "grabbing";
  e.dataTransfer.dropEffect = "copy";
  e.dataTransfer.setData("text", e.target.dataset.tileId)
};

let handleDragOver = (e) => {
  if (e.preventDefault) e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  return false;
};

const handleDragEnter = (e) => {
  e.preventDefault();
  e.target.classList.add("over");
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.target.classList.remove("over");
};

const handleDrop = e => {
  e.preventDefault();
  targetCell = e.target;
  targetCell.classList.remove("over");
  targetCell.classList.add("filled");
  console.log(`target cell: ${targetCell} grabbedTile: ${grabbedTile}`)

  
  let id = e.dataTransfer.getData('text');
  let tileToAdd = document.querySelector(`.tile[data-tile-id="${id}"]`);
  e.target.appendChild(tileToAdd);
  tileToAdd.style.opacity = "";
}

const handleDragEnd = e => {
  console.log(`${e.type}`);
  const id = e.dataTransfer.getData('text')
  let grabbedTile = document.querySelector(`.tile[data-tile-id="${id}"]`)
   grabbedTile.style.opacity = 1;
}


const swapTileToNewCell = () => {
  
}

document.querySelectorAll(".tile").forEach((tile) => {
  tile.addEventListener("dragstart", handleDragStart, options);
});

document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("dragenter", handleDragEnter, options);
  cell.addEventListener("dragleave", handleDragLeave, options);
  cell.addEventListener("dragover", handleDragOver, options);

  cell.addEventListener("dragend", handleDragEnd, options);
  cell.addEventListener("drop", handleDrop, options);
});

document.addEventListener("drop", handleDrop, options);