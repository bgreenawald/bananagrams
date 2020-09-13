/**
 * High level board modules controlling the creation and maintainence of the board.
 */

import {
    handleDragEnter,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleOnMouseDown,
    handleDrop,
    resetModifiers,
    toggleMenu,
    menuVisible,
    options,
} from './events';
import { columns, rows } from './helpers';

const menu = document.querySelector(".menu");

document.addEventListener("drop", function () {
    resetModifiers('tile');
}, options);

var selectAllTiles = function () {
    var board = document.querySelector("#board");
    Array.from(document.querySelectorAll('.tile')).forEach(function (tile) {
        if (board.contains(tile)) {
            tile.classList.add('selected');
        }
    });
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

var init_board = function () {// Initially hide everything
    document.getElementById("gameplay").style.display = "none";
    document.getElementById("game_over").style.display = "none";

    // Warn user before leaving
    window.onbeforeunload = function () {
        return 'Are you sure you want to leave, this will clear your board?';
    };

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
}

init_board();
populateBoard();

export {
    rows,
    columns
};