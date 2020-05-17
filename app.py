import atexit
import datetime
import logging
import os
import sys
from typing import Any, Dict

import simplejson
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, json, render_template, request, Response
from flask_cors import CORS
from flask_scss import Scss
from flask_socketio import emit, join_room, SocketIO
from jsonschema import validate, ValidationError

from game import Game, GameException

# Initialize the application
app = Flask(__name__, static_url_path="", static_folder="static")
app.debug = True
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app)

# Add Sass
Scss(app, static_dir="static/styles/css", asset_dir="static/styles/scss")

# Initialize CORS
CORS(app)

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

# Boolean to determine if game is being run locally. Used for testing
test = False

# ---------------------------------------
# App routes
# ---------------------------------------


@app.route("/")
def return_index() -> str:
    return render_template("index.html")


@app.route("/game/<int:id>")
def return_game(id: str) -> str:
    return render_template("game.html", id=id)


@app.route("/api/get_names")
def get_names() -> Response:
    ids = [x for x in all_games]
    return json.jsonify({"ids": ids})


# ---------------------------------------
# Socket functions
# ---------------------------------------


@socketio.on("join")
def on_join(data: Dict[str, Any]):
    """Joins the connection to the provided room
    Args:
        data (dict): Name of the room.
    """
    schema = {"type": "object", "properties": {"name": {}}}
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input.")
    else:
        room_name = data["name"]
        join_room(room_name)
        logger.info(f"{request.sid} has entered the room {room_name}")


@socketio.on("connect")
def on_connect():
    """Called on client connect.
    """
    logger.info(f"{request.sid} has connected.")


@socketio.on("disconnect")
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


@socketio.on("load_game")
def load_game(data: Dict[Any, Any]):
    """Loads the current game game, or creates on if none exists.
    Args:
        data (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    schema = {"type": "object", "properties": {"name": {}}}
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input.")
    else:
        game_name = data["name"]

        if game_name not in all_games:
            cur_game = Game(game_name)
            all_games[game_name] = cur_game
        else:
            game = all_games[game_name]
            emit_game(game_name, game, "Game loaded.")


@socketio.on("player_join")
def player_join(data: Dict[Any, Any]):
    """Adds a player to the game.

    Args:
        data (Dict[Any, Any]): {
            "name": (Any) The name of the game.
            "player_id": (Any) ID of the player to join the game.
        }
    """
    schema = {"type": "object", "properties": {"name": {}, "player_id": {}}}
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input.")
    else:
        game_name = data["name"]
        try:
            game = all_games[game_name]
        except KeyError:
            logger.warning(f"Could not find the game named {game_name}.")
            emit_error(game_name, f"Could not find the game named {game_name}.")
            return

        # See if the player has already joined
        if data["player_id"] in game.players:
            emit_game(
                game_name,
                game,
                f"Player {data['player_id']} already joined, returning game.",
            )
            return
        try:
            game.join_game(data["player_id"])
            emit_game(game_name, game, f"Added player {data['player_id']} to game.")
        except GameException as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("start_game")
def start_game(data: Dict[Any, Any]):
    """Starts the game.

    Args:
        data (Dict[Any, Any]): {
            "name": (Any) The name of the game.
        }
    """
    schema = {"type": "object", "properties": {"name": {}}}
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input.")
    else:
        game_name = data["name"]
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


@socketio.on("peel")
def peel(data: Dict[Any, Any]):
    """Gives every player a new tile.

    Args:
        data (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    schema = {"type": "object", "properties": {"name": {}}}
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input.")
    else:
        game_name = data["name"]
        try:
            game = all_games[game_name]
        except KeyError:
            logger.warning(f"Could not find the game named {game_name}.")
            emit_error(game_name, f"Could not find the game named {game_name}.")
            return

        try:
            game.peel(test=test)
            emit_game(game_name, game, "New tile given out.")
        except GameException as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("swap")
def swap(data: Dict[Any, Any]):
    """
    Swaps a letter for a given player.

    Args:
        data (Dict[Any, Any]): {
            "game": (Any) The name of the game.
            "player_id": (Any). The player to perform the swap on.
            "letter": (str) The letter to swap out.
        }
    """
    schema = {
        "type": "object",
        "properties": {"name": {}, "player_id": {}, "letter": {"type": "string"}},
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input.")
    else:
        game_name = data["name"]
        try:
            game = all_games[game_name]
        except KeyError:
            logger.warning(f"Could not find the game named {game_name}.")
            emit_error(game_name, f"Could not find the game named {game_name}.")
            return

        try:
            game.swap(data["letter"], data["player_id"])
            emit_game(game_name, game, f"Performed swap for player {data['player_id']}")
        except GameException as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("bananagrams")
def bananagrams(data: Dict[Any, Any]):
    """
    When someone gets bananagrams.

    Args:
        data (Dict[Any, Any]): {
            "game": (Any) The name of the game.
            "player_id": (Any). The player to perform the swap on.
            "words": (List[str]) The words from the winning board.
        }
    """
    schema = {
        "type": "object",
        "properties": {"name": {}, "player_id": {}, "words": {"type": "array"}},
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input.")
    else:
        game_name = data["name"]
        try:
            game = all_games[game_name]
        except KeyError:
            logger.warning(f"Could not find the game named {game_name}.")
            emit_error(game_name, f"Could not find the game named {game_name}.")
            return

        try:
            game.bananagrams(data["player_id"], data["words"])
            emit_game(game_name, game, "Bananagrams.")
        except GameException as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("continue_game")
def continue_game(data: Dict[Any, Any]):
    """
    Continues the game on false alarm banagrams.

    Args:
        data (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    schema = {"type": "object", "properties": {"name": {}}}
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input.")
    else:
        game_name = data["name"]
        try:
            game = all_games[game_name]
        except KeyError:
            logger.warning(f"Could not find the game named {game_name}.")
            emit_error(game_name, f"Could not find the game named {game_name}.")
            return

        try:
            game.continue_game()
            emit_game(game_name, game, f"Game '{game_name}' continued.")
        except GameException as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("reset")
def reset(data: Dict[Any, Any]):
    """Resets the given game.

    Args:
        data (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    schema = {"type": "object", "properties": {"name": {}}}
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input.")
    else:
        game_name = data["name"]
        try:
            game = all_games[game_name]
        except KeyError:
            logger.warning(f"Could not find the game named {game_name}.")
            emit_error(game_name, f"Could not find the game named {game_name}.")
            return

        game.reset()
        emit_game(game_name, game, f"Game '{game_name}' reset.")


# ---------------------------------------
# Other functions
# ---------------------------------------

# Schedule cleanup
def _delete_old_games():
    for game in all_games:
        age = datetime.datetime.now() - all_games[game].date_created
        if age.total_seconds() > 86400:
            del all_games[game]


scheduler = BackgroundScheduler()
scheduler.add_job(func=_delete_old_games, trigger="interval", seconds=3600)
scheduler.start()

# Shutdown your cron thread if the web process is stopped
atexit.register(lambda: scheduler.shutdown())


if __name__ == "__main__":
    socketio.run(app, debug=True)
    test = True
