/**
 * Function that renders the game based on the current state.
 */

import {
    handleClick,
    handleDragStart,
    handleDragEnd,
    handleDoubleClick,
    options
} from './events';
import { findDifference } from "./helpers";

var numberOfTiles = 0;

var enableDragging = function () {
    Array.from(document.querySelectorAll(".tile")).forEach(function (tile) {
        (tile as HTMLElement).draggable = true;
    });
};

var disableDragging = function () {
    Array.from(document.querySelectorAll(".tile")).forEach(function (tile) {
        (tile as HTMLElement).draggable = false;
    });
};

var createTiles = function (lettersArray) {
    var tilesArray = [];
    Array.prototype.forEach.call(lettersArray, function (letter, index) {
        tilesArray.push("<div class=\"cell\" data-row=\"0\" data-column=\"" + index + "\"><span class=\"tile\" data-tile-id=\"" + numberOfTiles + "\" draggable=\"true\">" + letter + "</span></div>");
        numberOfTiles += 1;
    });
    return tilesArray;
};

var addTileListener = function () {
    Array.from(Array.from(document.querySelectorAll(".tile"))).forEach(function (tile) {
        tile.addEventListener("dragstart", handleDragStart, options);
        tile.addEventListener("dblclick", handleDoubleClick);
        tile.addEventListener("click", handleClick, options);
        tile.addEventListener("dragend", handleDragEnd, options);
    });
};

function render_game(resp, player_id, tiles) {
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

    return tiles;
}

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

var populate = function (parentid, childrenArray) {
    var parent = document.getElementById(parentid);
    childrenArray.forEach(function (child) {
        parent.innerHTML += child;
    });
};


export { showError, render_game };