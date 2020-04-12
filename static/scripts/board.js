
let grabbedTile = null;
let targetCell = null;
let originCell = null;
let numberOfTiles = 0;

const menu = document.querySelector(".menu");
let menuVisible = false;

const options = false;


// global items for multi drag and drop

let tilesToDrag = [];


/********************* 
 * 
 *  Helper functions   
 *                  
 *********************/

const isHashMap = (item) => {
    return (!Array.isArray(item) && typeof(item) === 'object')
}

const saveToLocalStorage = (key, rawData) => {
    let data = rawData;
    if (isHashMap(data)) {
        data = JSON.stringify(data);
    }
    localStorage.setItem(key, data)
}

/********************* 
 * 
 *  Render functions   
 *                  
 *********************/

const getUserLetters = () => {
    const username = localStorage.getItem("player_id");
    const allTiles = JSON.parse(localStorage.getItem("players"));
    for (player in allTiles) {
        if (player === username) {
            return allTiles[username];
        }
    }
}

const createTiles = (lettersArray) => {
  let tilesArray = [];
  Array.prototype.forEach.call(lettersArray, function(letter, index) {
    tilesArray.push(`<div class="cell"><span class="tile" data-tile-id="${numberOfTiles}" data-row="0" data-column="${index}" draggable="true">${letter}</span></div>`);
    numberOfTiles += 1;
  });

  return tilesArray;
};

const createCells = (rows, columns) => {
  let cellsToAdd = "";
  for (let r=0; r < rows; r++) {
    for (let c=0; c < columns; c++) {
      cellsToAdd.innerHTML += `<div class="cell" data-row=${r} data-column=${c}></div>`;
    }
  }
}

const populateBoard = (rows, columns) => {
  let board = document.getElementById("board");
  for (let r=0; r < rows; r++) {
    for (let c=0; c < columns; c++) {
      board.innerHTML += `<div class="cell" data-row=${r} data-column=${c}></div>`;
    }
  }

  // Attach the listeners to the grid cells
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener("dragenter", handleDragEnter, options);
    cell.addEventListener("dragleave", handleDragLeave, options);
    cell.addEventListener("dragover", handleDragOver, options);

    cell.addEventListener("dragend", handleDragEnd, options);
    cell.addEventListener("drop", handleDrop, options);
  });

  centerBoard();
};

centerBoard = () => {
  const boardViewport = document.getElementById("board-viewport");
  const board = document.getElementById("board");
  const scrollPositionX =  board.offsetLeft + (board.offsetWidth / 2);
  const scrollPositionY = board.offsetTop + (board.offsetHeight / 3);
  boardViewport.scrollLeft = scrollPositionX;
  boardViewport.scrollTop = scrollPositionY;

}

const fillCells = (parentId, childrenArrayOrCellNumber) => {
  const parent = document.getElementById(parentId);
  if (typeof(childrenArrayOrCellNumber) === "number") {
    let num = childrenArrayOrCellNumber;
    for (let i = 0; i < num; i++) {
      parent.innerHTML += `<div class="cell"></div>`;
    }
  }
  else if (Array.isArray(childrenArrayOrCellNumber))

  children.forEach(child => {
    parent.innerHTML += child;
  })
}

const populate = (parentid, childrenArray) => {
  const parent = document.getElementById(parentid);
  childrenArray.forEach(child => {
    parent.innerHTML += child;
  })
}



/********************* 
 * 
 *  event handlers   
 *                  
 *********************/

const handleClick = e => {
  e.preventDefault();
  let classes = e.target.classList;
  classes.contains('selected') ? classes.remove('selected') : classes.add('selected');
}

const handleDragStart = e => {
  e.target.classList.add('selected');
  let selectedTiles = Array.from(document.querySelectorAll('.selected'));
  // casing of tileId is set by browser parsing
  tilesToDrag = selectedTiles.map(tile => {
    let tileData = {
      id: tile.dataset.tileId,
      initialRow: tile.parentElement.dataset.row,
      initialColumn: tile.parentElement.dataset.column
    }
    return tileData
  });
  e.target.style.cursor = "grabbing";
  e.dataTransfer.dropEffect = "copy";
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text", e.target.dataset.tileId);
};

let handleDragOver = e => {
  if (e.preventDefault) e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  return false;
};

const handleDragEnter = e => {
  e.preventDefault();
  e.target.classList.add("over");
};

const handleDragLeave = e => {
  e.preventDefault();
  e.target.classList.remove("over");
};

const handleDrop = e => {
  e.preventDefault();
  let primaryDestination = e.target;
  primaryDestination.classList.remove("over");
  primaryDestination.classList.add("filled");

  let id = e.dataTransfer.getData('text');
  let primaryTile = document.querySelector(`.tile[data-tile-id="${id}"]`);
  // const primaryInitialCoords = [primaryTile.parentElement.dataset.row, primaryTile.parentElement.dataset.column];
  e.target.appendChild(primaryTile);
  primaryTile.dataset.destinationRow = primaryDestination.dataset.row;
  primaryTile.dataset.destinationColumn = primaryDestination.dataset.column;

  // move the rest of the tiles:
  // calculate the new coords for the rest of the tiles. 
    // if primary tile's origin is not null,
            // calculate distance difference from primary tile's origin vs. target cell 
      const rowChange = Number(primaryTile.dataset.destinationRow) - Number(primaryTile.dataset.row);
      const columnChange = Number(primaryTile.dataset.destinationColumn) - Number(primaryTile.dataset.column);
        // calculate new coors for secondary cells. (origins + dist = targets)
        tilesToDrag.forEach(tileData => {
          secondaryTile = document.querySelector(`.tile[data-tile-id="${tileData.id}"]`);

          // secondaryTile.dataset.relativeRow = Number(primaryTile.dataset.row) - Number(secondaryTile.dataset.row); 
          // secondaryTile.dataset.relativeColumn = Number(primaryTile.dataset.column) - Number(secondaryTile.dataset.column);

          // secondaryTile.dataset.destinationRow = Number(secondaryTile.dataset.relativeRow) + Number(primaryTile.dataset.destinationRow);
          // secondaryTile.dataset.destinationColumn =  Number(secondaryTile.dataset.relativeColumn) + Number(primaryTile.dataset.destinationColumn);

          secondaryTile.dataset.destinationRow = rowChange + Number(secondaryTile.dataset.row);
          secondaryTile.dataset.destinationColumn = columnChange + Number(secondaryTile.dataset.column);
          
          let secondaryDestination = document.querySelector( `#board .cell[data-row="${secondaryTile.dataset.destinationRow}"][data-column="${secondaryTile.dataset.destinationColumn}"]`);
          secondaryDestination.appendChild(secondaryTile);
        })
    // else primary tile's origin coords are null 
      // 
    // calculate distance difference from primary tile's origin vs. target cell
  // get the new destination cells with the coords
  // get the tiles to move from the global ids array
  // append the tiles to the cells

  // Clean out any empty bench slots
  tilesToDrag = [];
  cleanBench();
}

const handleDragEnd = e => {
  console.log(`${e.type}`);
  const id = e.dataTransfer.getData('text')
  let grabbedTile = document.querySelector(`.tile[data-tile-id="${id}"]`)
}

const handleDoubleClick = e => {
  e.preventDefault();
  menu.setAttribute("active-tile-id", tile.getAttribute("data-tile-id"))
  // Set the position for the menu
  const origin = {
    left: e.pageX,
    top: e.pageY
  };
  setPosition(origin);
  return false;
}

const resetTileOpacity = e => {
  e.target.style.opacity = "";
}

const resetModifiers = (className) => {
  const elements = Array.from(document.querySelectorAll(`.${className}`));
  elements.forEach(element => {
    element.classList.remove("selected");
    element.classList.opacity = "";
  })
}

const addTileListener = () => {
  document.querySelectorAll(".tile").forEach(tile => {
    tile.addEventListener("dragstart", handleDragStart, options);
    tile.addEventListener("dblclick", handleDoubleClick);
    tile.addEventListener("click", handleClick, options);
    tile.addEventListener("dragend", resetTileOpacity, options);
  });
}

document.addEventListener("drop", () => {resetModifiers('tile')}, options);

const cleanBench = () => {
  var bench = document.querySelector("#bench");

  // Create a list of all empty children
  var emptyCells = [];
  Array.prototype.forEach.call(bench.children, function(cell, index){
    if (cell.children.length == 0) {
      emptyCells.push(cell);
    }
  });

  // Remove each empty child from the bench
  Array.prototype.forEach.call(emptyCells, function(cell, index){
    bench.removeChild(cell);
  });

  // recalculate row and columns of bench
  Array.from(bench.children).forEach((benchCell, index) => {
    benchCell.dataset.column = index;
  });

}

const toggleMenu = command => {
  menu.style.display = command === "show" ? "block" : "none";
  menuVisible = !menuVisible;
};

const setPosition = ({ top, left }) => {
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  toggleMenu('show');
};


/*
  Ben Code
*/

// Global variables needed
var socket = io();
var href_parts = window.location.href.split("/");
var game_name = href_parts[href_parts.length - 1];
var player_id = null;
var tiles = [];

// Whether the current client has already joined the game
var hasJoined = false;

// Warn user before leaving
window.onbeforeunload = function () {
    return 'Are you sure you want to leave, this will clear your board?';
};

// --------------------------------------
// Actions taken on connect

// Join the necessary room
socket.on("connect", function () {
    socket.emit("join", {
        "name": game_name
    });
});

// --------------------------------------
// Render game action
socket.on("render_game", function (resp) {
    // Do not render the game if the client has not joined the game
    if (!hasJoined) {
        return;
    }
    if (!resp.hasOwnProperty("status_code")) {
        showError("Did not recieve a response from the server.")
    } else {
        if (resp["status_code"] == 200) {
            game_state = JSON.parse(resp.payload);
            render_game(game_state);
        } else {
            if (!resp.hasOwnProperty("message")) {
                showError("An error occurred, but no message was given.")
            } else {
                showError(`An error occurred: ${resp["message"]}`)
            }
        }
    }
});

function render_game(resp) {
    console.log(resp);
    var cur_tiles = resp["players"][player_id];

    // Hide the join game option
    $("#join_game").hide();

    // Render the game based on the various game states

    // Waiting to give out tiles
    if (game_state["state"] == "IDLE") {
        hideButtons();
        $("#message").innerHTML =
            "<p>Waiting for other players to join. When everyone is in, click 'Deal the Tiles'</p>"
        $("#options").show();
        $("#start_game_button").show();
    } // The main gamplay state
    else if (resp["state"] == "ACTIVE") {
        hideButtons();
        $("#message").innerHTML = "<p>Game on! Build a valid scrabble board with your words.</p>"
        $("#options").show();
        $("#peel_button").show();

        // Render only the new tiles
        var newTiles = findDifference(cur_tiles, tiles);
        tiles = cur_tiles;
        populate("bench", createTiles(newTiles));
        addTileListener();
    } // Can no longer peel
    else if (resp["state"] == "ENDGAME") {
        hideButtons();
        $("#message").innerHTML = "<p>Almost done! Be the first to complete your board.</p>"
        $("#options").show();
        $("#bananagrams_button").show();
    } // Game over
    else if (resp["state"] == "OVER") {
        hideButtons();
        $("#message").innerHTML =
            "<p>Game over? Check the winning board. If it's a false alarm, click 'Continue Game,' otherwise, click 'Reset Game' to play again.</p>"
        $("#options").show();
        $("#continue_game_button").show();
    } // Unknown state
    else {
        showError(`An error occurred: Unknown client state.`)
    }

}

// --------------------------------------
//Client functions

// Manually load the current game
function load_game() {
    socket.emit("load_game", {
        "name": game_name
    })
}

// Join the game
function player_join() {
    load_game();
    player_id = document.getElementById("player_id").value;
    localStorage.setItem("player_id", player_id);
    socket.emit("player_join", {
        "name": game_name,
        "player_id": player_id
    })
    hasJoined = true;
}

// Start the game
function start_game() {
    socket.emit("start_game", {
        "name": game_name,
    })
}

// Perform the split action
function split() {
    socket.emit("split", {
        "name": game_name,
    })
}

// Perform the peel action
function peel() {
    socket.emit("peel", {
        "name": game_name,
    })
}

// Perform a swap
function swap() {
    let active_tile_id = menu.getAttribute("active-tile-id")
    let tileToRemove = document.querySelector(`.tile[data-tile-id="${active_tile_id}"]`);
    let letter = tileToRemove.textContent;
    tileToRemove.parentNode.removeChild(tileToRemove);
    socket.emit("swap", {
        "name": game_name,
        "letter": letter,
        "player_id": player_id
    })
}

// Bananagrams
function bananagrams() {
    socket.emit("bananagrams", {
        "name": game_name,
    })
}

// Continue the game
function continue_game() {
    socket.emit("continue_game", {
        "name": game_name,
    })
}

// Reset the game
function reset() {
    socket.emit("reset", {
        "name": game_name
    });
}

// --------------------------------------
// Non-socket functions
function showError(msg) {
    $("#error").html(msg);
}

function hideButtons() {
    $("#start_game_button").hide();
    $("#split_button").hide();
    $("#peel_button").hide();
    $("#bananagrams_button").hide();
    $("#continue_game_button").hide();
}

function findDifference(a, b) {
  var ret = a.slice();
  for (val of b) {
    var index = ret.indexOf(val);
    if (index > -1) {
      ret.splice(index, 1);
    }
  }

  return ret;
}

// const findDifference = (newTiles, oldTiles) => {
//     oldTiles.filter((oldTile, index) => {
//         newTiles.contains(oldTile)
//     } )
// }
// --------------------------------------
// Keybindings

// Player ID enter
var input = document.getElementById("player_id");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        $("#player_id_submit").click();
    }
});

// Peel
document.addEventListener("keyup", function (event) {
    if (event.keyCode === 80) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        $("#peel_button").click();
    }
});

// Document
document.addEventListener("keyup", function (event) {
    if (event.keyCode === 66) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        $("#bananagrams_button").click();
    }
});



// Pre-populatethe board
populateBoard(15, 15);

window.addEventListener("click", e => {
  if(menuVisible)toggleMenu("hide");
});
