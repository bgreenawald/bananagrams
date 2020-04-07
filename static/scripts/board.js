
let lettersArray = [];
let grabbedTile = null;
let targetCell = null;
let originCell = null;

const options = false;

const renderBoard = (arr) => {
  const tilesArray = createTiles(arr);
  populateBoard(400);
  populate("bench", tilesArray);
}

const createTiles = (lettersArray) => {
  const tilesArray =  lettersArray.map((letter, index) => {
    return `<div class="cell"><span class="tile" data-tile-id="${index}" draggable="true">${letter}</span></div>`;
  });

  return tilesArray;
};

const populateBoard = (num) => {
  let board = document.getElementById("board");
  for (let i = 0; i < num; i++) {
    board.innerHTML += `<div class="cell"></div>`;
  }
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
    tiles = resp["players"][player_id];

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
    } // Tiles dealt, waiting to start
    else if (resp["state"] == "HIDDEN") {
        hideButtons();
        $("#message").innerHTML = "<p>Get ready! Click 'Split' when everyone is good to go.</p>"
        $("#options").show();
        $("#split_button").show();
    } // The main gamplay state
    else if (resp["state"] == "ACTIVE") {
        hideButtons();
        $("#message").innerHTML = "<p>Game on! Build a valid scrabble board with your words.</p>"
        $("#options").show();
        $("#peel_button").show();
        $("#swap_button").show();
        renderBoard()
    } // Can no longer swap
    else if (resp["state"] == "ENDGAME") {
        hideButtons();
        $("#message").innerHTML = "<p>Almost done! Be the first to complete your board.</p>"
        $("#options").show();
        $("#bananagrams_button").show();
        $("#swap_button").show();
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
    var letter = tiles.pop();
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
    $("#swap_button").hide();
    $("#bananagrams_button").hide();
    $("#continue_game_button").hide();
}

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

// Swap
document.addEventListener("keyup", function (event) {
    if (event.keyCode === 83) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        $("#swap_button").click();
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