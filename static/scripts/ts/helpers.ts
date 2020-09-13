/*********************
 *
 *  General helper functions
 *
 *********************/

const rows = 35;
const columns = 35;


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

var findDifference = function (a, b) {
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

export {
    findDifference,
    getAllWords,
    getTileNeighbors,
    isValidBoard,
    columns,
    rows,
};