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
    return (!Array.isArray(item) && typeof (item) === 'object')
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
    Array.prototype.forEach.call(lettersArray, function (letter, index) {
        tilesArray.push(`<div class="cell" data-row="0" data-column="${index}"><span class="tile" data-tile-id="${numberOfTiles}" draggable="true">${letter}</span></div>`);
        numberOfTiles += 1;
    });

    return tilesArray;
};


const fillCells = (parentId, childrenArrayOrCellNumber) => {
    const parent = document.getElementById(parentId);
    if (typeof (childrenArrayOrCellNumber) === "number") {
        let num = childrenArrayOrCellNumber;
        for (let i = 0; i < num; i++) {
            parent.innerHTML += `<div class="cell"></div>`;
        }
    } else if (Array.isArray(childrenArrayOrCellNumber))

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
    if (!e.target.classList.contains('selected')) {
        e.target.classList.add("selected")
    };
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

const handleDragEnter = e => {
    e.preventDefault();
    if (e.target.children.length === 0) {
        e.target.classList.add("over");
    }

};

const handleDragLeave = e => {
    e.preventDefault();
    if (e.target.classList.contains("over")) {
        e.target.classList.remove("over");
    }
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

    let id = e.dataTransfer.getData('text');
    let primaryTile = document.querySelector(`.tile[data-tile-id="${id}"]`);
    primaryTile.dataset.row = primaryTile.parentElement.dataset.row;
    primaryTile.dataset.column = primaryTile.parentElement.dataset.column;

    primaryTile.dataset.destinationRow = primaryDestinationCell.dataset.row;
    primaryTile.dataset.destinationColumn = primaryDestinationCell.dataset.column;

    const rowChange = Number(primaryTile.dataset.destinationRow) - Number(primaryTile.dataset.row);
    const columnChange = Number(primaryTile.dataset.destinationColumn) - Number(primaryTile.dataset.column);

    var queueLength = null;

    // Continuously try and move tiles one by one until no progress is made.
    while (queueLength != tilesToDrag.length) {
        queueLength = tilesToDrag.length;
        for (var i = 0; i < queueLength; i += 1) {
            var tileData = tilesToDrag.shift();
            secondaryTile = document.querySelector(`.tile[data-tile-id="${tileData.id}"]`);
            secondaryTile.dataset.row = secondaryTile.parentElement.dataset.row;
            secondaryTile.dataset.column = secondaryTile.parentElement.dataset.column;

            secondaryTile.dataset.destinationRow = rowChange + Number(secondaryTile.dataset.row);
            secondaryTile.dataset.destinationColumn = columnChange + Number(secondaryTile.dataset.column);

            secondaryTile.dataset.row = secondaryTile.dataset.destinationRow;
            secondaryTile.dataset.column = secondaryTile.dataset.destinationColumn;

            let secondaryDestination = document.querySelector(`#board .cell[data-row="${secondaryTile.dataset.destinationRow}"][data-column="${secondaryTile.dataset.destinationColumn}"]`);
            if (secondaryDestination.children.length > 0) {
                tilesToDrag.push(tileData);
            } else {
                secondaryDestination.appendChild(secondaryTile);
                primaryDestinationCell.classList.remove("over");
                primaryDestinationCell.classList.add("filled");
            }
        }
    }
    tilesToDrag = [];
    cleanBench();
    resetModifiers('tile');
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

document.addEventListener("drop", () => {
    resetModifiers('tile')
}, options);

const cleanBench = () => {
    var bench = document.querySelector("#bench");

    // Create a list of all empty children
    var emptyCells = [];
    Array.prototype.forEach.call(bench.children, function (cell, index) {
        if (cell.children.length == 0) {
            emptyCells.push(cell);
        }
    });

    // Remove each empty child from the bench
    Array.prototype.forEach.call(emptyCells, function (cell, index) {
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

const setPosition = ({
    top,
    left
}) => {
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

const getTileNeighbors = (tile) => {
    let neighbors = [];
    let tileRow = parseInt(tile.getAttribute("data-row"));
    let tileColumn = parseInt(tile.getAttribute("data-column"));
    var board = document.querySelector("#board");

    // Based on the row and column values, get the appropriate neighbors
    if (tileRow > 0) {
        neighbors.push(board.querySelectorAll(`.cell[data-row="${tileRow - 1}"][data-column="${tileColumn}"]`)[0])
    }
    if (tileRow < rows - 1) {
        neighbors.push(board.querySelectorAll(`.cell[data-row="${tileRow + 1}"][data-column="${tileColumn}"]`)[0])
    }
    if (tileColumn > 0) {
        neighbors.push(board.querySelectorAll(`.cell[data-row="${tileRow}"][data-column="${tileColumn - 1}"]`)[0])
    }
    if (tileColumn < columns - 1) {
        neighbors.push(board.querySelectorAll(`.cell[data-row="${tileRow}"][data-column="${tileColumn + 1}"]`)[0])
    }

    return neighbors;
}

const isValidBoard = () => {
    var board = document.querySelector("#board");

    // Make sure the bench is empty
    if (document.getElementById("bench").children.length > 0) {
        return false;
    }

    // Using a queue, process each tile and make sure we can get to every tile
    var processTiles = [];
    var seenTiles = [];
    processTiles.push(board.querySelectorAll(".tile")[0]);
    while (processTiles.length > 0) {
        var curTile = processTiles.pop();

        if (!seenTiles.includes(curTile)) {
            seenTiles.push(curTile);
        }

        // Get all neighbors of the current tiles and push them on if they haven't yet been seen
        Array.from(getTileNeighbors(curTile)).forEach(neighbor => {
            if (neighbor.children.length > 0) {
                var childTile = neighbor.children[0];

                // If we have not yet seen the processed tile, push it onto the queue
                if (!seenTiles.includes(childTile)) {
                    processTiles.push(childTile);
                }
            }
        })
    }

    // If we hit every tile, then we have a valid board
    console.log(`Seen tiles ${seenTiles.length}`);
    console.log(`All tiles ${board.querySelectorAll(".tile").length}`);

    return seenTiles.length === board.querySelectorAll(".tile").length;
}

const getAllWords = () => {
    let allWords = [];
    // Get all words row wise
    for (let r = 0; r < rows; r++) {
        var curWord = "";
        for (let c = 0; c < columns; c++) {
            var curCell = board.querySelectorAll(`.cell[data-row="${r}"][data-column="${c}"]`)[0];
            if (curCell.children.length > 0) {
                curWord += curCell.children[0].textContent;
            } else {
                if (curWord.length > 1) {
                    allWords.push(curWord);
                }
                curWord = "";
            }
        }
    }

    // Get all column wise
    for (let c = 0; c < columns; c++) {
        var curWord = "";
        for (let r = 0; r < rows; r++) {
            var curCell = board.querySelectorAll(`.cell[data-row="${r}"][data-column="${c}"]`)[0];
            if (curCell.children.length > 0) {
                curWord += curCell.children[0].textContent;
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

populateBoard();

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
var game_state = null;

// Whether the current client has already joined the game
var hasJoined = false;

// Initially hide everything
document.getElementById("gameplay").style.display = "none";
document.getElementById("game_over").style.display = "none";

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

    // Render the game based on the various game states

    // Waiting to give out tiles
    if (resp["state"] == "IDLE") {
        hideButtons();
        $("#join_game").hide();
        $(".lobby").show();
        $("#options").show();
        $("#start_game_button").show();
    } // The main gamplay state
    else if (resp["state"] == "ACTIVE") {
        $("#gameplay").show();
        $(".lobby").hide();
        hideButtons();
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
        $("#gameplay").show();
        $(".lobby").hide();
        $("#game_over").hide();
        $("#options").show();
        $("#bananagrams_button").show();
        $("#select_button").show();

        // Render only the new tiles
        var newTiles = findDifference(cur_tiles, tiles);
        tiles = cur_tiles;
        populate("bench", createTiles(newTiles));
        addTileListener();
    } // Game over
    else if (resp["state"] == "OVER") {
        hideButtons();
        disableDragging();
        $("#game_over").show();
        $("#gameplay").hide()
        $(".lobby").hide();
        $("#options").show()
        $("#continue_game_button").show();

        // Display the winning content
        document.getElementById("winning_player").textContent = `${resp["winning_player"]} has called Bananagrams. Verify their board and either continue the game or start a new one!`
        // Check each winning word's validity and color accordingly
        var winning_words_list = document.getElementById("winning_words");
        winning_words_list.innerHTML = "";
        resp["winning_words"].forEach(word_pair => {
            if (word_pair[1]) {
                winning_words_list.innerHTML += `<p style="color: green">${word_pair[0]}</p>`
            } else {
                winning_words_list.innerHTML += `<p style="color: red">${word_pair[0]}</p>`
            }
        })
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
    // Make sure the board is valid
    if (!isValidBoard()) {
        alert("Your bench must be empty and your board must be valid.")
        return
    }
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
    // Also remove element from the global tiles array
    var index = tiles.indexOf(letter);
    if (index !== -1) tiles.splice(index, 1);

    socket.emit("swap", {
        "name": game_name,
        "letter": letter,
        "player_id": player_id
    });
    cleanBench();
}

// Bananagrams
function bananagrams() {
    // Make sure the board is valid
    if (!isValidBoard()) {
        alert("Your bench must be empty and your board must be valid.")
        return
    }

    var words = getAllWords();
    socket.emit("bananagrams", {
        "name": game_name,
        "player_id": player_id,
        "words": words
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


window.addEventListener("click", e => {
    if (menuVisible) toggleMenu("hide");
});