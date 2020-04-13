import logging
import os
import sys
from typing import Any, Dict

import simplejson
from flask import Flask, json, render_template, request, Response
from flask_cors import CORS
from flask_scss import Scss
from flask_socketio import emit, join_room, SocketIO

from game import Game, GameException

# Initialize the application
application = Flask(__name__)
application.debug = True
application.config["SECRET_KEY"] = "secret!"
app = SocketIO(application)

# Add Sass
Scss(application, static_dir="static/styles/css", asset_dir="static/styles/scss")

# Initialize CORS
CORS(application)

# Setup logging
if not os.path.isdir("logs"):
    os.makedirs("logs")
logger = logging.getLogger(__name__)
logger.setLevel("DEBUG")
handler = logging.FileHandler("logs/app.log")
shell_handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(
    logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
)
logger.addHandler(handler)
logger.addHandler(shell_handler)

# Dictionary to hold all games
all_games: Dict[str, Game] = {}

# ---------------------------------------
# App routes
# ---------------------------------------


@application.route("/")
def return_index() -> str:
    return render_template("index.html")


@application.route("/game/<int:id>")
def return_game(id: str) -> str:
    return render_template("game.html", id=id)


@application.route("/api/get_names")
def get_names() -> Response:
    ids = [x for x in all_games]
    return json.jsonify({"ids": ids})


# ---------------------------------------
# Socket functions
# ---------------------------------------


@app.on("join")
def on_join(data: Dict[str, Any]):
    """Joins the connection to the provided room
    Args:
        data (dict): Name of the room.
    """
    room_name = data["name"]
    join_room(room_name)
    logger.info(f"{request.sid} has entered the room {room_name}")


@app.on("connect")
def on_connect():
    """Called on client connect.
    """
    logger.info(f"{request.sid} has connected.")


@app.on("disconnect")
def on_disconnect():
    """Called on client disconnect.
    """
    logger.info(f"{request.sid} has disconnected.")


def emit_error(game_name: str, msg: str):
    logging.error(msg)
    emit(
        "render_game",
        {"status_code": 400, "message": msg, "payload": {}},
        room=game_name,
    )


def emit_game(game_name: str, game: Game, msg: str):
    emit(
        "render_game",
        {
            "status_code": 200,
            "message": msg,
            "payload": simplejson.dumps(game, for_json=True),
        },
        room=game_name,
    )


@app.on("load_game")
def load_game(json: Dict[Any, Any]):
    """Loads the current game game, or creates on if none exists.
    Args:
        json (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    game_name = json["name"]

    if game_name not in all_games:
        cur_game = Game(game_name)
        all_games[game_name] = cur_game
    else:
        game = all_games[game_name]
        emit_game(game_name, game, "Game loaded.")


@app.on("player_join")
def player_join(json: Dict[Any, Any]):
    """Adds a player to the game.

    Args:
        json (Dict[Any, Any]): {
            "name": (Any) The name of the game.
            "player_id": (str) ID of the player to join the game.
        }
    """
    if "name" not in json:
        logger.warning("Could not find the given game.")
        return

    game_name = json["name"]
    try:
        game = all_games[game_name]
    except KeyError:
        logger.warning(f"Could not find the game named {game_name}.")
        emit_error(game_name, f"Could not find the game named {game_name}.")
        return

    if "player_id" not in json:
        emit_error(json["name"], "Invalid data for this endpoint. Missing 'player_id'")

    # See if the player has already joined
    if json["player_id"] in game.players:
        emit_game(
            game_name,
            game,
            f"Player {json['player_id']} already joined, returning game.",
        )
        return
    try:
        game.join_game(json["player_id"])
        emit_game(game_name, game, f"Added player {json['player_id']} to game.")
    except GameException as e:
        logging.error("Exception occurred", exc_info=True)
        emit_error(game_name, str(e))


@app.on("start_game")
def start_game(json: Dict[Any, Any]):
    """Starts the game.

    Args:
        json (Dict[Any, Any]): {
            "name": (Any) The name of the game.
        }
    """
    if "name" not in json:
        logger.warning("Could not find the given game.")
        return

    game_name = json["name"]
    try:
        game = all_games[game_name]
    except KeyError:
        logger.warning(f"Could not find the game named {game_name}.")
        emit_error(game_name, f"Could not find the game named {game_name}.")
        return

    try:
        game.start_game()
        emit_game(game_name, game, "Game started")
    except GameException as e:
        logging.error("Exception occurred", exc_info=True)
        emit_error(game_name, str(e))


@app.on("peel")
def peel(json: Dict[Any, Any]):
    """Gives every player a new tile.

    Args:
        json (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    if "name" not in json:
        logger.warning("Could not find the given game.")
        return

    game_name = json["name"]
    try:
        game = all_games[game_name]
    except KeyError:
        logger.warning(f"Could not find the game named {game_name}.")
        emit_error(game_name, f"Could not find the game named {game_name}.")
        return

    try:
        game.peel()
        emit_game(game_name, game, "New tile given out.")
    except GameException as e:
        logging.error("Exception occurred", exc_info=True)
        emit_error(game_name, str(e))


@app.on("swap")
def swap(json: Dict[Any, Any]):
    """
    Swaps a letter for a given player.

    Args:
        json (Dict[Any, Any]): {
            "game": (Any) The name of the game.
            "letter": (str) The letter to swap out.
            "player_id": (str). The player to perform the swap on.
        }
    """
    if "name" not in json:
        logger.warning("Could not find the given game.")
        return

    game_name = json["name"]
    try:
        game = all_games[game_name]
    except KeyError:
        logger.warning(f"Could not find the game named {game_name}.")
        emit_error(game_name, f"Could not find the game named {game_name}.")
        return

    if "letter" not in json or "player_id" not in json:
        emit_error(
            json["name"],
            "Invalid data for this endpoint. Missing 'player_id' or 'letter'.",
        )

    try:
        game.swap(json["letter"], json["player_id"])
        emit_game(game_name, game, f"Performed swap for player {json['player_id']}")
    except GameException as e:
        logging.error("Exception occurred", exc_info=True)
        emit_error(game_name, str(e))


@app.on("bananagrams")
def bananagrams(json: Dict[Any, Any]):
    """
    When someone gets bananagrams.

    Args:
        json (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    if "name" not in json:
        logger.warning("Could not find the given game.")
        return

    game_name = json["name"]
    try:
        game = all_games[game_name]
    except KeyError:
        logger.warning(f"Could not find the game named {game_name}.")
        emit_error(game_name, f"Could not find the game named {game_name}.")
        return

    try:
        game.bananagrams()
        emit_game(game_name, game, "Bananagrams.")
    except GameException as e:
        logging.error("Exception occurred", exc_info=True)
        emit_error(game_name, str(e))


@app.on("continue_game")
def continue_game(json: Dict[Any, Any]):
    """
    Continues the game on false alarm banagrams.

    Args:
        json (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    if "name" not in json:
        logger.warning("Could not find the given game.")
        return

    game_name = json["name"]
    try:
        game = all_games[game_name]
    except KeyError:
        logger.warning(f"Could not find the game named {game_name}.")
        emit_error(game_name, f"Could not find the game named {game_name}.")
        return

    try:
        game.continue_game()
        emit_game(game_name, game, "Game continued.")
    except GameException as e:
        logging.error("Exception occurred", exc_info=True)
        emit_error(game_name, str(e))


@app.on("reset")
def reset(json: Dict[Any, Any]):
    """Resets the given game.

    Args:
        json (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    if "name" not in json:
        logger.warning("Could not find the given game.")
        return

    game_name = json["name"]
    try:
        game = all_games[game_name]
    except KeyError:
        logger.warning(f"Could not find the game named {game_name}.")
        emit_error(game_name, f"Could not find the game named {game_name}.")
        return

    game.reset()
    emit_game(game_name, game, "Game reset.")


if __name__ == "__main__":
    app.run(application, debug=True)
