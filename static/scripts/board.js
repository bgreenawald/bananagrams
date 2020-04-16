
let grabbedTile = null;
let targetCell = null;
let originCell = null;
let numberOfTiles = 0;

const menu = document.querySelector(".menu");
let menuVisible = false;

const options = false;

let rows = 35;
let columns = 35;


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
    tilesArray.push(`<div class="cell" data-row="0" data-column="${index}"><span class="tile" data-tile-id="${numberOfTiles}" draggable="true">${letter}</span></div>`);
    numberOfTiles += 1;
  });

  return tilesArray;
};


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

const selectAllTiles = () => {
  var board = document.querySelector("#board");
  Array.from(document.querySelectorAll('.tile')).forEach(tile => {
    if (board.contains(tile)) {
      tile.classList.add('selected')
    }
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
  e.target.style.opacity = .4;
  e.target.classList.remove('selected');
  let selectedTiles = Array.from(document.querySelectorAll('.selected'));
  // casing of tileId is set by browser parsing
  tilesToDrag = selectedTiles.map(tile => {
    let tileData = {
      id: tile.dataset.tileId,
      row: tile.parentElement.dataset.row,
      column: tile.parentElement.dataset.column
    }
    return tileData
  });
  e.target.style.cursor = "grabbing";
  e.dataTransfer.dropEffect = "copy";
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text", e.target.dataset.tileId);
};

const handleDragEnd = e => {
  e.target.style.opacity = "";
}

const handleDoubleClick = e => {
  e.preventDefault();
  menu.setAttribute("active-tile-id", e.target.getAttribute("data-tile-id"))
  // Set the position for the menu
  const origin = {
    left: e.pageX,
    top: e.pageY
  };
  setPosition(origin);
  return false;
}

const resetModifiers = (className) => {
  const elements = Array.from(document.querySelectorAll(`.${className}`));
  elements.forEach(element => {
    element.classList.remove("selected");
    element.style.opacity = "";
  })
}

const addTileListener = () => {
  document.querySelectorAll(".tile").forEach(tile => {
    tile.addEventListener("dragstart", handleDragStart, options);
    tile.addEventListener("dblclick", handleDoubleClick);
    tile.addEventListener("click", handleClick, options);
    tile.addEventListener("dragend", handleDragEnd, options);
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

const enableDragging = () => {
  document.querySelectorAll(".tile").forEach(tile => {
    tile.draggable = true;
  });
}

const disableDragging = () => {
  document.querySelectorAll(".tile").forEach(tile => {
    tile.draggable = false;
  });
}


/*
  Ben Code
*/

// Global variables needed
var socket = io();
var href_parts = window.location.href.split("/");
var game_name = href_parts[href_parts.length - 1];
var player_id = null;
var tiles = [];
var players = null;

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
    load_game()
});

// --------------------------------------
// Render game action
socket.on("render_game", function (resp) {

    if (!resp.hasOwnProperty("status_code")) {
        showError("Did not recieve a response from the server.")
    } else {
        if (resp["status_code"] == 200) {
            game_state = JSON.parse(resp.payload);
            // Do not render the game if the client has not joined the game
            players = game_state["players"];
            let player_list = document.getElementById("players");
            player_list.innerHTML = ""
            Object.entries(players).forEach(player => {
              player_list.innerHTML += "<li>" + player[0] + "</li>";
            })
            if (!hasJoined) {
              return;
            } else {
              render_game(game_state);
            }
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
    $('#gameplay').hide();

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
      $("#gameplay").show();
        $(".lobby").hide();
        hideButtons();
        $("#message").innerHTML = "<p>Game on! Build a valid scrabble board with your words.</p>"
        $("#options").show();
        $("#peel_button").show();
        $("#select_button").show();

        // Render only the new tiles
        var newTiles = findDifference(cur_tiles, tiles);
        tiles = cur_tiles;
        populate("bench", createTiles(newTiles));
        addTileListener();
    } // Can no longer peel
    else if (resp["state"] == "ENDGAME") {
        hideButtons();
        enableDragging();
        $("#message").innerHTML = "<p>Almost done! Be the first to complete your board.</p>";
        $("#options").show();
        $("#bananagrams_button").show();
        $("#select_button").show();
    } // Game over
    else if (resp["state"] == "OVER") {
        hideButtons();
        disableDragging();
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
    });
    cleanBench();
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
    document.querySelectorAll(`.tile`).forEach(tile => {
      tile.parentNode.removeChild(tile);
    });
    cleanBench();
    tiles = [];
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
    $("#select_button").hide();
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
populateBoard();

window.addEventListener("click", e => {
  if(menuVisible)toggleMenu("hide");
});
