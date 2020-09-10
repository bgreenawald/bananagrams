var grabbedTile = null;
var targetCell = null;
var originCell = null;
var numberOfTiles = 0;
var menu = document.querySelector(".menu");
var menuVisible = false;
var options = false;
var rows = 35;
var columns = 35;
// global items for multi drag and drop
var tilesToDrag = [];
/*********************
 *
 *  Helper functions
 *
 *********************/
var isHashMap = function (item) {
    return (!Array.isArray(item) && typeof (item) === 'object');
};
var saveToLocalStorage = function (key, rawData) {
    var data = rawData;
    if (isHashMap(data)) {
        data = JSON.stringify(data);
    }
    localStorage.setItem(key, data);
};
/*********************
 *
 *  Render functions
 *
 *********************/
var createTiles = function (lettersArray) {
    var tilesArray = [];
    Array.prototype.forEach.call(lettersArray, function (letter, index) {
        tilesArray.push("<div class=\"cell\" data-row=\"0\" data-column=\"" + index + "\"><span class=\"tile\" data-tile-id=\"" + numberOfTiles + "\" draggable=\"true\">" + letter + "</span></div>");
        numberOfTiles += 1;
    });
    return tilesArray;
};
var populate = function (parentid, childrenArray) {
    var parent = document.getElementById(parentid);
    childrenArray.forEach(function (child) {
        parent.innerHTML += child;
    });
};
var selectAllTiles = function () {
    var board = document.querySelector("#board");
    Array.from(document.querySelectorAll('.tile')).forEach(function (tile) {
        if (board.contains(tile)) {
            tile.classList.add('selected');
        }
    });
};
/*********************
 *
 *  event handlers
 *
 *********************/
var handleClick = function (e) {
    e.preventDefault();
    var classes = e.target.classList;
    classes.contains('selected') ? classes.remove('selected') : classes.add('selected');
};
var handleDragStart = function (e) {
    e.target.style.opacity = .4;
    if (!e.target.classList.contains('selected')) {
        e.target.classList.add("selected");
    }
    ;
    var selectedTiles = Array.from(document.querySelectorAll('.selected'));
    // casing of tileId is set by browser parsing
    tilesToDrag = selectedTiles.map(function (tile) {
        var tileData = {
            id: tile.dataset.tileId,
            row: tile.parentElement.dataset.row,
            column: tile.parentElement.dataset.column
        };
        return tileData;
    });
    e.target.style.cursor = "grabbing";
    e.dataTransfer.dropEffect = "copy";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text", e.target.dataset.tileId);
};
var handleDragEnd = function (e) {
    e.target.style.opacity = "";
};
var handleDoubleClick = function (e) {
    e.preventDefault();
    menu.setAttribute("active-tile-id", e.target.getAttribute("data-tile-id"));
    // Set the position for the menu
    var origin = {
        left: e.pageX,
        top: e.pageY
    };
    setPosition(origin);
    return false;
};
var handleDragEnter = function (e) {
    e.preventDefault();
    if (e.target.children.length === 0) {
        e.target.classList.add("over");
    }
};
var handleDragLeave = function (e) {
    e.preventDefault();
    if (e.target.classList.contains("over")) {
        e.target.classList.remove("over");
    }
};
var handleDragOver = function (e) {
    if (e.preventDefault)
        e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    return false;
};
var handleOnMouseDown = function (e) {
    if (e.preventDefault)
        e.preventDefault();
    return false;
};
var id = null;
var handleDrop = function (e) {
    e.preventDefault();
    var primaryDestinationCell = e.target;
    // Get the tile ID and handle the null case
    id = e.dataTransfer.getData('text');
    if (id === null || id.trim() === "") {
        if (primaryDestinationCell.classList.contains("over")) {
            primaryDestinationCell.classList.remove("over");
        }
        return;
    }
    var primaryTile = document.querySelector(".tile[data-tile-id=\"" + id + "\"]");
    var sourceRow = primaryTile.parentElement.dataset.row;
    var sourceColumn = primaryTile.parentElement.dataset.column;
    var destinationRow = primaryDestinationCell.dataset.row;
    var destinationColumn = primaryDestinationCell.dataset.column;
    var rowChange = Number(destinationRow) - Number(sourceRow);
    var columnChange = Number(destinationColumn) - Number(sourceColumn);
    var queueLength = null;
    // Continuously try and move tiles one by one until no progress is made.
    while (queueLength != tilesToDrag.length) {
        queueLength = tilesToDrag.length;
        for (var i = 0; i < queueLength; i += 1) {
            var tileData = tilesToDrag.shift();
            var secondaryTile = document.querySelector(".tile[data-tile-id=\"" + tileData.id + "\"]");
            sourceRow = secondaryTile.parentElement.dataset.row;
            sourceColumn = secondaryTile.parentElement.dataset.column;
            destinationRow = rowChange + Number(sourceRow);
            destinationColumn = columnChange + Number(sourceColumn);
            var secondaryDestination = document.querySelector("#board .cell[data-row=\"" + destinationRow + "\"][data-column=\"" + destinationColumn + "\"]");
            if (secondaryDestination.children.length > 0) {
                tilesToDrag.push(tileData);
            }
            else {
                secondaryDestination.appendChild(secondaryTile);
                primaryDestinationCell.classList.remove("over");
                primaryDestinationCell.classList.add("filled");
                secondaryTile.dataset.row = destinationRow;
                secondaryTile.dataset.column = destinationColumn;
            }
        }
    }
    tilesToDrag = [];
    cleanBench();
    resetModifiers('tile');
};
var resetModifiers = function (className) {
    var elements = Array.from(document.querySelectorAll("." + className));
    elements.forEach(function (element) {
        element.classList.remove("selected");
        let htmlElement = element;
        htmlElement.style.opacity = "";
    });
};
var addTileListener = function () {
    Array.from(Array.from(document.querySelectorAll(".tile"))).forEach(function (tile) {
        tile.addEventListener("dragstart", handleDragStart, options);
        tile.addEventListener("dblclick", handleDoubleClick);
        tile.addEventListener("click", handleClick, options);
        tile.addEventListener("dragend", handleDragEnd, options);
    });
};
document.addEventListener("drop", function () {
    resetModifiers('tile');
}, options);
var cleanBench = function () {
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
    Array.from(bench.children).forEach(function (benchCell, index) {
        benchCell.dataset.column = index.toString();
    });
};
var toggleMenu = function (command) {
    menu.style.display = command === "show" ? "block" : "none";
    menuVisible = !menuVisible;
};
var setPosition = function (_a) {
    var top = _a.top, left = _a.left;
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    toggleMenu('show');
};
var enableDragging = function () {
    Array.from(document.querySelectorAll(".tile")).forEach(function (tile) {
        tile.draggable = true;
    });
};
var disableDragging = function () {
    Array.from(document.querySelectorAll(".tile")).forEach(function (tile) {
        tile.draggable = false;
    });
};
var getTileNeighbors = function (tile) {
    var neighbors = [];
    var tileRow = parseInt(tile.getAttribute("data-row"));
    var tileColumn = parseInt(tile.getAttribute("data-column"));
    var board = document.querySelector("#board");
    // Based on the row and column values, get the appropriate neighbors
    if (tileRow > 0) {
        neighbors.push(board.querySelectorAll(".cell[data-row=\"" + (tileRow - 1) + "\"][data-column=\"" + tileColumn + "\"]")[0]);
    }
    if (tileRow < rows - 1) {
        neighbors.push(board.querySelectorAll(".cell[data-row=\"" + (tileRow + 1) + "\"][data-column=\"" + tileColumn + "\"]")[0]);
    }
    if (tileColumn > 0) {
        neighbors.push(board.querySelectorAll(".cell[data-row=\"" + tileRow + "\"][data-column=\"" + (tileColumn - 1) + "\"]")[0]);
    }
    if (tileColumn < columns - 1) {
        neighbors.push(board.querySelectorAll(".cell[data-row=\"" + tileRow + "\"][data-column=\"" + (tileColumn + 1) + "\"]")[0]);
    }
    return neighbors;
};
var isValidBoard = function () {
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
        Array.from(getTileNeighbors(curTile)).forEach(function (neighbor) {
            if (neighbor.children.length > 0) {
                var childTile = neighbor.children[0];
                // If we have not yet seen the processed tile, push it onto the queue
                if (!seenTiles.includes(childTile)) {
                    processTiles.push(childTile);
                }
            }
        });
    }
    // If we hit every tile, then we have a valid board
    console.log("Seen tiles " + seenTiles.length);
    console.log("All tiles " + board.querySelectorAll(".tile").length);
    return seenTiles.length === board.querySelectorAll(".tile").length;
};
var getAllWords = function () {
    var allWords = [];
    var board = document.querySelector("#board");
    // Get all words row wise
    for (var r = 0; r < rows; r++) {
        var curWord = "";
        for (var c = 0; c < columns; c++) {
            var curCell = board.querySelectorAll(".cell[data-row=\"" + r + "\"][data-column=\"" + c + "\"]")[0];
            if (curCell.children.length > 0) {
                curWord += curCell.children[0].textContent;
            }
            else {
                if (curWord.length > 1) {
                    allWords.push(curWord);
                }
                curWord = "";
            }
        }
    }
    // Get all column wise
    for (var c = 0; c < columns; c++) {
        var curWord = "";
        for (var r = 0; r < rows; r++) {
            var curCell = board.querySelectorAll(".cell[data-row=\"" + r + "\"][data-column=\"" + c + "\"]")[0];
            if (curCell.children.length > 0) {
                curWord += curCell.children[0].textContent;
            }
            else {
                if (curWord.length > 1) {
                    allWords.push(curWord);
                }
                curWord = "";
            }
        }
    }
    return allWords;
};
var populateBoard = function () {
    var board = document.getElementById("board");
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {
            board.innerHTML += "<div class=\"cell\" data-row=" + r + " data-column=" + c + "></div>";
        }
    }
    // Attach the listeners to the grid cells
    Array.from(document.querySelectorAll(".cell")).forEach(function (cell) {
        cell.addEventListener("onmousedown", handleOnMouseDown, options);
        cell.addEventListener("dragenter", handleDragEnter, options);
        cell.addEventListener("dragleave", handleDragLeave, options);
        cell.addEventListener("dragover", handleDragOver, options);
        cell.addEventListener("dragend", handleDragEnd, options);
        cell.addEventListener("drop", handleDrop, options);
    });
    centerBoard();
};
var centerBoard = function () {
    var boardViewport = document.getElementById("board-viewport");
    var board = document.getElementById("board");
    var scrollPositionX = board.offsetLeft + (board.offsetWidth / 2);
    var scrollPositionY = board.offsetTop + (board.offsetHeight / 3);
    boardViewport.scrollLeft = scrollPositionX;
    boardViewport.scrollTop = scrollPositionY;
};
populateBoard();
/*
  Ben Code
*/
// Global variables needed
// @ts-ignore
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
    load_game();
});
// --------------------------------------
// Render game action
socket.on("render_game", function (resp) {
    if (!resp.hasOwnProperty("status_code")) {
        showError("Did not recieve a response from the server.");
    }
    else {
        if (resp["status_code"] == 200) {
            game_state = JSON.parse(resp.payload);
            // Do not render the game if the client has not joined the game
            players = game_state["players"];
            var player_list_1 = document.getElementById("players");
            player_list_1.innerHTML = "";
            Object.entries(players).forEach(function (player) {
                player_list_1.innerHTML += "<li>" + player[0] + "</li>";
            });
            if (!hasJoined) {
                return;
            }
            else {
                render_game(game_state);
            }
        }
        else {
            if (!resp.hasOwnProperty("message")) {
                showError("An error occurred, but no message was given.");
            }
            else {
                showError("An error occurred: " + resp["message"]);
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
        $("#tiles_remaining").show();
        // Update the count
        document.getElementById("tiles_remaining_count").textContent = resp["tiles_remaining"];
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
        $("#gameplay").hide();
        $(".lobby").hide();
        $("#options").show();
        $("#continue_game_button").show();
        // Display the winning content
        document.getElementById("winning_player").textContent = resp["winning_player"] + " has called Bananagrams. Verify their board and either continue the game or start a new one!";
        // Check each winning word's validity and color accordingly
        var winning_words_list = document.getElementById("winning_words");
        winning_words_list.innerHTML = "";
        resp["winning_words"].forEach(function (word_pair) {
            if (word_pair[1]) {
                winning_words_list.innerHTML += "<p style=\"color: green\">" + word_pair[0] + "</p>";
            }
            else {
                winning_words_list.innerHTML += "<p style=\"color: red\">" + word_pair[0] + "</p>";
            }
        });
    } // Unknown state
    else {
        showError("An error occurred: Unknown client state.");
    }
}
// --------------------------------------
//Client functions
// Manually load the current game
function load_game() {
    socket.emit("load_game", {
        "name": game_name
    });
}
// Join the game
function player_join() {
    player_id = document.getElementById("player_id").value;
    localStorage.setItem("player_id", player_id);
    socket.emit("player_join", {
        "name": game_name,
        "player_id": player_id
    });
    hasJoined = true;
}
// Start the game
function start_game() {
    socket.emit("start_game", {
        "name": game_name,
    });
}
// Perform the split action
function split() {
    socket.emit("split", {
        "name": game_name,
    });
}
// Perform the peel action
function peel() {
    // Make sure the board is valid
    if (!isValidBoard()) {
        alert("Your bench must be empty and your board must be valid.");
        return;
    }
    socket.emit("peel", {
        "name": game_name,
    });
}
// Perform a swap
function swap() {
    var active_tile_id = menu.getAttribute("active-tile-id");
    var tileToRemove = document.querySelector(".tile[data-tile-id=\"" + active_tile_id + "\"]");
    var letter = tileToRemove.textContent;
    tileToRemove.parentNode.removeChild(tileToRemove);
    // Also remove element from the global tiles array
    var index = tiles.indexOf(letter);
    if (index !== -1)
        tiles.splice(index, 1);
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
        alert("Your bench must be empty and your board must be valid.");
        return;
    }
    var words = getAllWords();
    socket.emit("bananagrams", {
        "name": game_name,
        "player_id": player_id,
        "words": words
    });
}
// Continue the game
function continue_game() {
    socket.emit("continue_game", {
        "name": game_name,
    });
}
// Reset the game
function reset() {
    Array.from(document.querySelectorAll(".tile")).forEach(function (tile) {
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
    $("#tiles_remaining").hide();
}
function findDifference(a, b) {
    var ret = a.slice();
    for (var _i = 0, b_1 = b; _i < b_1.length; _i++) {
        var val = b_1[_i];
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
window.addEventListener("click", function (e) {
    if (menuVisible)
        toggleMenu("hide");
});
