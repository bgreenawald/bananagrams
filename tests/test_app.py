# API tests for the Flask app
import json

import pytest

from app import app, all_games, socketio
from game import Game, GameException


@pytest.fixture
def client():
    app.config["TESTING"] = True
    all_games["TEST_GAME"] = Game("test_game")

    with app.test_client() as client:
        yield client


@pytest.fixture
def socket_client(client):
    with socketio.test_client(app, flask_test_client=client) as socket_client:
        yield socket_client


def test_get_names(client):
    resp = client.get("/api/get_names")
    assert resp.status_code == 200
    assert json.loads(resp.data.decode("utf-8")) == {"ids": ["TEST_GAME"]}


def test_join(socket_client):
    socket_client.emit("join", {"name": "TEST_GAME"})
    received = socket_client.get_received()
    

