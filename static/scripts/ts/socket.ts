/**
 * Socket functions that make calls to the backend and call the render function based on the response.
 */

import { cleanBench } from './events';
import { getAllWords, isValidBoard } from "./helpers";
import { render_game, showError } from "./render";

var socket_state = {
    "player_id": null,
    "game_state": null,
    "dev": false,
};

let tiles = [];
let players = null;
const href_parts = window.location.href.split("/");
const game_name = href_parts[href_parts.length - 1];
const menu = document.querySelector(".menu");

// Whether the current client has already joined the game
let hasJoined = false;

// @ts-ignore
const socket = io();

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
            socket_state.game_state = JSON.parse(resp.payload);
            // Do not render the game if the client has not joined the game
            players = socket_state.game_state["players"];
            var player_list_1 = document.getElementById("players");
            player_list_1.innerHTML = "";
            Object.entries(players).forEach(function (player) {
                player_list_1.innerHTML += "<li>" + player[0] + "</li>";
            });
            if (!hasJoined) {
                return;
            }
            else {
                tiles = render_game(socket_state.game_state,socket_state.player_id, tiles);
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
    socket_state.player_id = (<HTMLInputElement>document.getElementById("player_id")).value;
    localStorage.setItem("player_id", socket_state.player_id);
    socket.emit("player_join", {
        "name": game_name,
        "player_id": socket_state.player_id
    });
    hasJoined = true;
}

function dev_join() {
    socket_state.player_id = "dev_p1"
    socket_state.dev = true;
    hasJoined = true;
    load_game();
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
    if (!socket_state.dev && !isValidBoard()) {
        alert("Your bench must be empty and your board must be valid.");
        return;
    }
    socket.emit("peel", {
        "name": game_name,
    });
}

// Perform a swap
function swap() {
    if (socket_state.game_state["tiles_remaining"] < 3) {
        alert("Less that 3 tiles remaining, cannot swap.");
        return;
    }

    var active_tile_id = menu.getAttribute("active-tile-id");
    var tileToRemove = document.querySelector(".tile[data-tile-id=\"" + active_tile_id + "\"]");
    try {
        var letter = tileToRemove.textContent;
    } catch (TypeError) {
        alert("No tile selected for swapping, double click a tile to select!");
        return;
    }
    tileToRemove.parentNode.removeChild(tileToRemove);
    // Also remove element from the global tiles array
    var index = tiles.indexOf(letter);
    if (index !== -1)
        tiles.splice(index, 1);
    socket.emit("swap", {
        "name": game_name,
        "letter": letter,
        "player_id": socket_state.player_id
    });
    cleanBench();
}

// Bananagrams
function bananagrams() {
    // Make sure the board is valid
    if (!socket_state.dev && !isValidBoard()) {
        alert("Your bench must be empty and your board must be valid.");
        return;
    }
    var words = getAllWords();
    socket.emit("bananagrams", {
        "name": game_name,
        "player_id": socket_state.player_id,
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
    dev_join,
    player_join,
    load_game,
    start_game,
    split,
    peel,
    reset,
    bananagrams,
    continue_game,
    swap,
    socket_state,
}