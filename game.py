import datetime
import random
from enum import Enum
from typing import Any, Dict


TILE_FREQUENCIES = {
    2: ["J", "K", "Q", "X", "Z"],
    3: ["B", "C", "F", "H", "M", "P", "V", "W", "Y"],
    4: ["G"],
    5: ["L"],
    6: ["D", "S", "U"],
    8: ["N"],
    9: ["T", "R"],
    11: ["O"],
    12: ["I"],
    13: ["A"],
    18: ["E"],
}


class State(Enum):
    """Defines the current state of a turn.
    """

    # Waiting for players to join the game
    IDLE = "IDLE"

    # The tiles have been given out but are hidden
    HIDDEN = "HIDDEN"

    # The main game state, where peels are allowed
    ACTIVE = "ACTIVE"

    # Peels are no longer allowed but the game continues
    ENDGAME = "ENDGAME"

    # The game is over
    OVER = "OVER"


class GameException(Exception):
    pass


class Game(object):
    """
    A class representing an entire game.

    Attributes:
        id (str): Id of a game.
        tiles (List[str]): The list of tiles for a game.
        tiles_remaining (int): The number of tiles left in the game.
        num_players (int): The number of players.
        player_tiles (Dict[str, List[str]]): A dictionary mapping each player to their tiles.

    """

    def __init__(self, id: str):
        self.id: str = id

        # Tile generation
        self.tiles = []
        for count, letters in TILE_FREQUENCIES.items():
            for letter in letters:
                for _ in range(count):
                    self.tiles.append(letter)
        random.shuffle(self.tiles)

        # General game fields
        self.state = State.IDLE
        self.num_players = None
        self.tiles_remaining = len(self.tiles)

        # Date created.
        self.date_created = datetime.datetime.now()

        # Player tile tracking
        self.players = {}

    def reset(self,):
        # Tile generation
        self.tiles = []
        for count, letters in TILE_FREQUENCIES.items():
            for letter in letters:
                for _ in range(count):
                    self.tiles.append(letter)
        random.shuffle(self.tiles)

        # General game fields
        self.state = State.IDLE
        self.num_players = len(self.players)
        self.tiles_remaining = len(self.tiles)

        # Date created
        self.date_created = datetime.datetime.now()

        # Reset player tiles
        for player in self.players:
            self.players[player] = []

    def __str__(self) -> str:  # pragma: no cover
        return (
            f"ID: {self.id}\n"
            f"Players: {[player for player in self.players]}\n"
            f"Number of Players: {self.num_players}\n"
            f"Tiles Remaining: {self.tiles_remaining}\n"
            f"State: {self.state}"
        )

    def __json__(self) -> Dict[str, Any]:  # pragma: no cover
        return {
            "id": self.id,
            # General game configuration
            "state": self.state.value,
            "num_players": self.num_players,
            "tiles_remaining": self.tiles_remaining,
            # Players
            "players": self.players,
        }

    for_json = __json__

    def join_game(self, player_id: str):
        """Add a player to the players roster.

        Args:
            player_id (str): The ID of the player to add.
        """
        if self.state != State.IDLE:
            raise GameException(
                f"Cannot add players, game state is {self.state} when it should be 'IDLE'"
            )
        if player_id not in self.players:
            self.players[player_id] = []

    def start_game(self):
        """Starts the game by setting the number of players and divvying out tiles.
        """
        if self.state != State.IDLE:
            raise GameException(
                f"Cannot start game, game state is {self.state} when it shoudl be 'IDLE'"
            )
        else:
            self.num_players = len(self.players)
            self._divy_out_tiles()
            self.state = State.HIDDEN

    def _divy_out_tiles(self):
        """Divy out the correct number of tiles to each player.

        Raises:
            GameException: Invalid number of players.
        """
        if self.num_players < 2 or self.num_players > 8 or self.num_players is None:
            raise GameException("Invalid Number of Players")

        # Give out number of tiles based on number of players
        if 2 <= self.num_players <= 4:
            num_tiles = 21
        elif 5 <= self.num_players <= 6:
            num_tiles = 15
        elif 7 <= self.num_players <= 8:
            num_tiles = 11

        for player in self.players:
            for _ in range(num_tiles):
                self.players[player].append(self.tiles.pop())

        self.tiles_remaining = len(self.tiles)

    def split(self):
        """Start the game action.
        """
        if self.state != State.HIDDEN:
            raise GameException(
                f"Cannot split, game state is {self.state} when it should be 'HIDDEN'"
            )
        else:
            self.state = State.ACTIVE

    def peel(self):
        """Give a new tile to each player.
        """
        if self.state != State.ACTIVE:
            raise GameException(
                f"Cannot peel, game state is {self.state} when it should be 'ACTIVE'"
            )
        else:
            if self.num_players > self.tiles_remaining:
                raise GameException("Not enough tiles to deal.")

            # Give a new tile to each player.
            for player in self.players:
                self.players[player].append(self.tiles.pop())
            self.tiles_remaining = len(self.tiles)

            # See if we there are enough tiles left for another peel
            if self.tiles_remaining < self.num_players:
                self.state = State.ENDGAME

    def swap(self, letter, player):
        """Swap a given tile for three tiles for a player.

        Args:
            letter (str): The tile to put back into the pile.
            player (str): The ID of the player to perform the swap.

        Raises:
            GameException: The player does not have an instance of that tile.
        """
        if self.state not in [State.ACTIVE, State.ENDGAME]:
            raise GameException(
                f"Cannot swap, game state is {self.state} when it should be 'ACTIVE' or 'ENDGAME'"
            )
        else:
            if letter not in self.players[player]:
                raise GameException("Player does not have this letter to remove.")

            # Add three new tiles to the player, or all remaining tiles if less than 3 remain.
            for _ in range(min(3, self.tiles_remaining)):
                self.players[player].append(self.tiles.pop())

            # Remove one instance of the given letter from the player
            self.players[player].remove(letter)

            # Add the letter back to the tile pile and shuffle
            self.tiles.append(letter)
            random.shuffle(self.tiles)

            # Update number of tiles
            self.tiles_remaining = len(self.tiles)

            # Check if peels can still occur
            if self.tiles_remaining < self.num_players:
                self.state = State.ENDGAME

    def bananagrams(self):
        """End the game (someone has bananagrams)
        """
        if self.state != State.ENDGAME:
            raise GameException(
                f"Cannot call bananagrams, game state is {self.state} when it should be 'ENDGAME'"
            )
        else:
            self.state = State.OVER

    def continue_game(self):
        """Continue the game (false alarm on banagrams)
        """
        if self.state != State.OVER:
            raise GameException(
                f"Cannot continue game, game state is {self.state} when it should be 'OVER'"
            )
        else:
            self.state = State.ENDGAME
