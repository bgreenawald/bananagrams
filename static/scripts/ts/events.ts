/**
 * The events that handle the interactivity of the game.
 *
 */


// Global array used to manage the drag and drop.
let tilesToDrag = [];
let menuVisible = false;
const menu = document.querySelector(".menu");
const options = false;

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

    var selectedTiles = Array.from(document.querySelectorAll('.selected'));
    // casing of tileId is set by browser parsing
    tilesToDrag = selectedTiles.map(function (tile) {
        var tileData = {
            id: (tile as HTMLElement).dataset.tileId,
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
                (secondaryTile as HTMLElement).dataset.row = destinationRow;
                (secondaryTile as HTMLElement).dataset.column = destinationColumn;
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
        let htmlElement = <HTMLElement>element;
        htmlElement.style.opacity = "";
    });
};

var setPosition = function (_a) {
    var top = _a.top, left = _a.left;
    (menu as HTMLElement).style.left = left + "px";
    (menu as HTMLElement).style.top = top + "px";
    toggleMenu('show');
};

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
        (benchCell as HTMLElement).dataset.column = index.toString();
    });
};

var toggleMenu = function (command) {
    (menu as HTMLElement).style.display = command === "show" ? "block" : "none";
    menuVisible = !menuVisible;
};

export {
    cleanBench,
    handleClick,
    handleDoubleClick,
    handleDragEnd,
    handleDragEnter,
    handleDragStart,
    handleDragLeave,
    handleDragOver,
    handleOnMouseDown,
    handleDrop,
    resetModifiers,
    toggleMenu,
    menuVisible,
    options
};