/**
 * Socket functions that make calls to the backend and call the render function based on the response.
 */

import { cleanBench } from './events';
import { getAllWords, isValidBoard, findDifference } from "./helpers";
import { render_game, showError } from "./render";

var href_parts = window.location.href.split("/");
var game_name = href_parts[href_parts.length - 1];
var player_id = null;
var tiles = [];
var players = null;
var game_state = null;
var menu = document.querySelector(".menu");

// Whether the current client has already joined the game
var hasJoined = false;

// @ts-ignore
var socket = io();

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
                tiles = render_game(game_state, player_id, tiles);
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

function load_game() {
    socket.emit("load_game", {
        "name": game_name
    });
}
// Join the game
function player_join() {
    player_id = (<HTMLInputElement>document.getElementById("player_id")).value;
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

export {
    player_join,
    load_game,
    start_game,
    split,
    peel,
    reset,
    bananagrams,
    continue_game,
    swap,
}