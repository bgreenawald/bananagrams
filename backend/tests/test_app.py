# API tests for the Flask app
import json
import time

import pytest

from app import app, all_games, socketio
from game import Game


@pytest.fixture
def client():
    app.config["TESTING"] = True
    all_games["TEST_GAME"] = Game("test_game")

    with app.test_client() as client:
        yield client


@pytest.fixture
def socket_client():
    app.config["TESTING"] = True
    all_games["TEST_GAME"] = Game("test_game")
    client = app.test_client()
    socket_client = socketio.test_client(app, flask_test_client=client)
    socket_client.emit("join", {"name": "TEST_GAME"})
    yield socket_client


@pytest.fixture
def socket_client_init():
    app.config["TESTING"] = True
    all_games["TEST_GAME"] = Game("test_game")
    client = app.test_client()
    socket_client = socketio.test_client(app, flask_test_client=client)
    socket_client.emit("join", {"name": "TEST_GAME"})
    _ = socket_client.get_received()
    socket_client.emit("player_join", {"name": "TEST_GAME", "player_id": "p1"})
    _ = socket_client.get_received()
    socket_client.emit("player_join", {"name": "TEST_GAME", "player_id": "p2"})
    _ = socket_client.get_received()
    socket_client.emit("start_game", {"name": "TEST_GAME"})
    _ = socket_client.get_received()
    yield socket_client


@pytest.fixture
def socket_client_end():
    app.config["TESTING"] = True
    all_games["TEST_GAME"] = Game("test_game")
    client = app.test_client()
    socket_client_end = socketio.test_client(app, flask_test_client=client)
    socket_client_end.emit("join", {"name": "TEST_GAME"})
    _ = socket_client_end.get_received()
    socket_client_end.emit("player_join", {"name": "TEST_GAME", "player_id": "p1"})
    _ = socket_client_end.get_received()
    socket_client_end.emit("player_join", {"name": "TEST_GAME", "player_id": "p2"})
    _ = socket_client_end.get_received()
    socket_client_end.emit("start_game", {"name": "TEST_GAME"})
    _ = socket_client_end.get_received()
    all_games["TEST_GAME"].tiles = ["A", "B", "C"]
    all_games["TEST_GAME"].tiles_remaining = 3
    time.sleep(1)
    socket_client_end.emit("peel", {"name": "TEST_GAME"})
    _ = socket_client_end.get_received()
    yield socket_client_end


def test_get_names(client):
    resp = client.get("/api/get_names")
    assert resp.status_code == 200
    assert json.loads(resp.data.decode("utf-8")) == {"ids": ["TEST_GAME"]}


def test_load_game(socket_client):
    socket_client.emit("load_game", {"name": "TEST_GAME"})
    resp = socket_client.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 200
    assert resp[0]["args"][0]["message"] == "Game loaded."
    assert json.loads(resp[0]["args"][0]["payload"]) == {
        "id": "test_game",
        "state": "IDLE",
        "num_players": None,
        "tiles_remaining": 144,
        "players": {},
        "winning_words": None,
        "winning_player": None,
    }


def test_player_join_fail(socket_client):
    socket_client.emit("player_join", {"name": "TEST_GAME"})
    resp = socket_client.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 400
    assert (
        resp[0]["args"][0]["message"].split("\n")[0]
        == "'player_id' is a required property"
    )
    assert resp[0]["args"][0]["payload"] == {}


def test_player_join(socket_client):
    socket_client.emit("player_join", {"name": "TEST_GAME", "player_id": "p1"})
    resp = socket_client.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 200
    assert resp[0]["args"][0]["message"].split("\n")[0] == "Added player p1 to game."
    assert json.loads(resp[0]["args"][0]["payload"]) == {
        "id": "test_game",
        "state": "IDLE",
        "num_players": None,
        "tiles_remaining": 144,
        "players": {"p1": []},
        "winning_words": None,
        "winning_player": None,
    }


def test_change_player_id(socket_client):
    socket_client.emit("player_join", {"name": "TEST_GAME", "player_id": "p1"})
    _ = socket_client.get_received()
    socket_client.emit(
        "change_player_id",
        {"name": "TEST_GAME", "old_player_id": "p1", "new_player_id": "p2"},
    )
    resp = socket_client.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 200
    assert resp[0]["args"][0]["message"].split("\n")[0] == "Updated player ID p1 to p2."
    assert json.loads(resp[0]["args"][0]["payload"]) == {
        "id": "test_game",
        "state": "IDLE",
        "num_players": None,
        "tiles_remaining": 144,
        "players": {"p2": []},
        "winning_words": None,
        "winning_player": None,
    }


def test_change_player_id_fail(socket_client):
    socket_client.emit("player_join", {"name": "TEST_GAME", "player_id": "p1"})
    _ = socket_client.get_received()
    socket_client.emit(
        "change_player_id",
        {"name": "TEST_GAME", "old_player_id": "p3", "new_player_id": "p2"},
    )
    resp = socket_client.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 400
    assert (
        resp[0]["args"][0]["message"].split("\n")[0]
        == "Update player ID failed, old ID does not exist."
    )
    assert resp[0]["args"][0]["payload"] == {}


def test_start_game(socket_client):
    socket_client.emit("player_join", {"name": "TEST_GAME", "player_id": "p1"})
    _ = socket_client.get_received()
    socket_client.emit("player_join", {"name": "TEST_GAME", "player_id": "p2"})
    _ = socket_client.get_received()
    socket_client.emit("start_game", {"name": "TEST_GAME"})
    resp = socket_client.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 200
    assert resp[0]["args"][0]["message"] == "Game started."
    data = json.loads(resp[0]["args"][0]["payload"])
    assert len(data["players"]) == 2
    data.pop("players", None)
    assert data == {
        "id": "test_game",
        "state": "ACTIVE",
        "num_players": 2,
        "tiles_remaining": 102,
        "winning_words": None,
        "winning_player": None,
    }


def test_peel(socket_client_init):
    time.sleep(1)
    socket_client_init.emit("peel", {"name": "TEST_GAME"})
    resp = socket_client_init.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 200
    assert resp[0]["args"][0]["message"] == "New tile given out."
    data = json.loads(resp[0]["args"][0]["payload"])
    data.pop("players", None)
    assert data == {
        "id": "test_game",
        "state": "ACTIVE",
        "num_players": 2,
        "tiles_remaining": 100,
        "winning_words": None,
        "winning_player": None,
    }


def test_swap_fail(socket_client_init):
    socket_client_init.emit("swap", {"name": "TEST_GAME", "player_id": "p1"})
    resp = socket_client_init.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 400
    assert (
        resp[0]["args"][0]["message"].split("\n")[0]
        == "'letter' is a required property"
    )
    assert resp[0]["args"][0]["payload"] == {}


def test_swap(socket_client_init):
    letter = all_games["TEST_GAME"].players["p1"][0]
    socket_client_init.emit(
        "swap", {"name": "TEST_GAME", "player_id": "p1", "letter": letter}
    )
    resp = socket_client_init.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 200
    assert resp[0]["args"][0]["message"] == "Performed swap for player p1."
    data = json.loads(resp[0]["args"][0]["payload"])
    data.pop("players", None)
    assert data == {
        "id": "test_game",
        "state": "ACTIVE",
        "num_players": 2,
        "tiles_remaining": 100,
        "winning_words": None,
        "winning_player": None,
    }


def test_bananagrams_fail(socket_client_end):
    socket_client_end.emit("bananagrams", {"name": "TEST_GAME", "player_id": "p1"})
    resp = socket_client_end.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 400
    assert (
        resp[0]["args"][0]["message"].split("\n")[0] == "'words' is a required property"
    )
    assert resp[0]["args"][0]["payload"] == {}


def test_bananagrams(socket_client_end):
    socket_client_end.emit(
        "bananagrams", {"name": "TEST_GAME", "player_id": "p1", "words": []}
    )
    resp = socket_client_end.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 200
    assert resp[0]["args"][0]["message"] == "Bananagrams."
    data = json.loads(resp[0]["args"][0]["payload"])
    data.pop("players", None)
    assert data == {
        "id": "test_game",
        "state": "OVER",
        "num_players": 2,
        "tiles_remaining": 1,
        "winning_words": [],
        "winning_player": "p1",
    }


def test_continue_game(socket_client_end):
    socket_client_end.emit(
        "bananagrams", {"name": "TEST_GAME", "player_id": "p1", "words": []}
    )
    _ = socket_client_end.get_received()
    socket_client_end.emit("continue_game", {"name": "TEST_GAME"})
    resp = socket_client_end.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 200
    assert resp[0]["args"][0]["message"] == "Game 'TEST_GAME' continued."
    data = json.loads(resp[0]["args"][0]["payload"])
    data.pop("players", None)
    assert data == {
        "id": "test_game",
        "state": "ENDGAME",
        "num_players": 2,
        "tiles_remaining": 1,
        "winning_words": None,
        "winning_player": None,
    }


def test_reset_game(socket_client_end):
    socket_client_end.emit(
        "bananagrams", {"name": "TEST_GAME", "player_id": "p1", "words": []}
    )
    _ = socket_client_end.get_received()
    socket_client_end.emit("reset", {"name": "TEST_GAME"})
    resp = socket_client_end.get_received()
    assert resp[0]["name"] == "render_game"
    assert len(resp[0]["args"][0]) == 3
    assert resp[0]["args"][0]["status_code"] == 200
    assert resp[0]["args"][0]["message"] == "Game 'TEST_GAME' reset."
    data = json.loads(resp[0]["args"][0]["payload"])
    assert data == {
        "id": "test_game",
        "state": "IDLE",
        "num_players": None,
        "tiles_remaining": 144,
        "players": {"p1": [], "p2": []},
        "winning_words": None,
        "winning_player": None,
    }
