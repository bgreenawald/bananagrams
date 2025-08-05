import atexit
import datetime
import logging
import os
import sys
from typing import Any

import simplejson
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, Response, json
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
from jsonschema import ValidationError, validate

from game import Game, GameError

# Initialize the application
app = Flask(__name__, static_url_path="", static_folder="static")
app.debug = True
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
socketio = SocketIO(app)
socketio.init_app(
    app,
    cors_allowed_origins=os.environ.get(
        "ALLOWED_ORIGINS", "http://localhost:8080,http://localhost:3000"
    ).split(","),
)

# Initialize CORS
CORS(app)

# Setup logging
if not os.path.isdir("logs"):
    os.makedirs("logs")
logger = logging.getLogger(__name__)
logger.setLevel("DEBUG")
handler = logging.FileHandler("logs/app.log")
shell_handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
logger.addHandler(handler)
logger.addHandler(shell_handler)

# Dictionary to hold all games
all_games: dict[str, Game] = {}

# Boolean to determine if game is being run locally. Used for testing
test = False

# ---------------------------------------
# App routes
# ---------------------------------------


@app.route("/api/get_names")
def get_names() -> Response:
    ids = list(all_games)
    return json.jsonify({"ids": ids})


# ---------------------------------------
# Socket functions
# ---------------------------------------


@socketio.on("join")
def on_join(data: dict[str, Any]):
    """Joins the connection to the provided room
    Args:
        data (dict): Name of the room.
    """
    schema = {
        "type": "object",
        "properties": {"name": {"type": ["string", "number"]}},
        "required": ["name"],
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input. from join event")
    else:
        room_name = data["name"]
        join_room(room_name)
        logger.info(f"{"[session]"} has entered the room {room_name}")


@socketio.on("connect")
def on_connect():
    """Called on client connect."""
    logger.info(f"{"[session]"} has connected.")


@socketio.on("disconnect")
def on_disconnect():
    """Called on client disconnect."""
    logger.info(f"{"[session]"} has disconnected.")


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
    logger.info(f"{"[session]"} has successfully rendered their game with message {msg}")


@socketio.on("load_game")
def load_game(data: dict[Any, Any]):
    """Loads the current game game, or creates on if none exists.
    Args:
        data (Dict[Any, Any]): {
            "name": (Any) The name of the game.
            "test_mode": (bool, optional) Whether to create game in test mode.
        }
    """
    schema = {
        "type": "object",
        "properties": {
            "name": {"type": ["string", "number"]},
            "test_mode": {"type": "boolean"},
        },
        "required": ["name"],
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input. from load_game")
    else:
        game_name = data["name"]
        test_mode = data.get("test_mode", False)

        if game_name not in all_games:
            cur_game = Game(game_name, test_mode=test_mode)
            all_games[game_name] = cur_game
            if test_mode:
                emit_game(game_name, cur_game, "Test game created.")
        else:
            game = all_games[game_name]
            emit_game(game_name, game, "Game loaded.")


@socketio.on("player_join")
def player_join(data: dict[Any, Any]):
    """Adds a player to the game.

    Args:
        data (Dict[Any, Any]): {
            "name": (Any) The name of the game.
            "player_id": (Any) ID of the player to join the game.
        }
    """
    schema = {
        "type": "object",
        "properties": {
            "name": {"type": ["string", "number"]},
            "player_id": {"type": ["string", "number"]},
        },
        "required": ["name", "player_id"],
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input. from player_join")
    else:
        game_name = data["name"]
        try:
            game = all_games[game_name]
        except KeyError:
            logger.warning(f"Could not find the game named {game_name}. from player_join")
            emit_error(
                game_name,
                f"Could not find the game named {game_name}. from player_join",
            )
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
        except GameError as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("start_game")
def start_game(data: dict[Any, Any]):
    """Starts the game.

    Args:
        data (Dict[Any, Any]): {
            "name": (Any) The name of the game.
        }
    """
    schema = {
        "type": "object",
        "properties": {"name": {"type": ["string", "number"]}},
        "required": ["name"],
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input. from start_game")
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
            emit_game(game_name, game, "Game started.")
        except GameError as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("peel")
def peel(data: dict[Any, Any]):
    """Gives every player a new tile.

    Args:
        data (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    schema = {
        "type": "object",
        "properties": {"name": {"type": ["string", "number"]}},
        "required": ["name"],
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input. from peel")
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
        except GameError as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("swap")
def swap(data: dict[Any, Any]):
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
        "properties": {
            "name": {"type": ["string", "number"]},
            "player_id": {"type": ["string", "number"]},
            "letter": {"type": "string"},
        },
        "required": ["name", "player_id", "letter"],
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input. from swap")
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
            emit_game(game_name, game, f"Performed swap for player {data['player_id']}.")
        except GameError as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("bananagrams")
def bananagrams(data: dict[Any, Any]):
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
        "properties": {
            "name": {"type": ["string", "number"]},
            "player_id": {"type": ["string", "number"]},
            "words": {"type": "array"},
        },
        "required": ["name", "player_id", "words"],
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input. from bananagrams")
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
        except GameError as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("continue_game")
def continue_game(data: dict[Any, Any]):
    """
    Continues the game on false alarm banagrams.

    Args:
        data (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    schema = {
        "type": "object",
        "properties": {"name": {"type": ["string", "number"]}},
        "required": ["name"],
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input. from continue_game")
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
        except GameError as e:
            logging.error("Exception occurred", exc_info=True)
            emit_error(game_name, str(e))


@socketio.on("reset")
def reset(data: dict[Any, Any]):
    """Resets the given game.

    Args:
        data (Dict[Any, Any]): {
            "game": (Any) The name of the game.
        }
    """
    schema = {
        "type": "object",
        "properties": {"name": {"type": ["string", "number"]}},
        "required": ["name"],
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input. from reset")
    else:
        game_name = data["name"]
        try:
            game = all_games[game_name]
        except KeyError:
            logger.warning(f"Could not find the game named {game_name}. from reset")
            emit_error(game_name, f"Could not find the game named {game_name}. from reset")
            return

        game.reset()
        emit_game(game_name, game, f"Game '{game_name}' reset.")


@socketio.on("create_test_game")
def create_test_game(data: dict[Any, Any]):
    """Creates a new test game with minimal tiles and allows single player.

    Args:
        data (Dict[Any, Any]): {
            "name": (Any) The name of the game.
            "player_id": (Any) ID of the player to automatically join.
        }
    """
    schema = {
        "type": "object",
        "properties": {
            "name": {"type": ["string", "number"]},
            "player_id": {"type": ["string", "number"]},
        },
        "required": ["name", "player_id"],
    }
    try:
        validate(data, schema=schema)
    except ValidationError as e:
        if "name" in data:
            emit_error(data["name"], str(e))
        else:
            logger.error("No game specified in input. from create_test_game")
    else:
        game_name = data["name"]
        player_id = data["player_id"]

        # Create test game
        test_game = Game(game_name, test_mode=True)
        all_games[game_name] = test_game

        # Automatically join the player and start the game
        try:
            test_game.join_game(player_id)
            test_game.start_game()  # Auto-start test games
            emit_game(
                game_name,
                test_game,
                f"Test game created, player {player_id} joined, and game started!",
            )
        except GameError as e:
            logger.error("Exception occurred while creating test game", exc_info=True)
            emit_error(game_name, str(e))


# ---------------------------------------
# Other functions
# ---------------------------------------


# Schedule cleanup
def _delete_old_games():
    games_to_delete = []
    for game_name in all_games:
        age = datetime.datetime.now() - all_games[game_name].date_created
        if age.total_seconds() > 86400:
            games_to_delete.append(game_name)

    for game_name in games_to_delete:
        del all_games[game_name]


scheduler = BackgroundScheduler()
scheduler.add_job(func=_delete_old_games, trigger="interval", seconds=3600)
scheduler.start()

# Shutdown your cron thread if the web process is stopped
atexit.register(lambda: scheduler.shutdown())


if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    socketio.run(app, debug=debug_mode)
    test = debug_mode
