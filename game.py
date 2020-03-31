import datetime
import random
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


class GameException(Exception):
    pass


class Game(object):
    """
    A class representing an entire game.

    Attributes:
        id (str): Id of a game.
        tiles (List[str]): The list of tiles for a game.
        is_active (bool): Whether the current game is active (whether to show tiles).
        is_over (bool): Whether a game is in a over state.
        can_draw_tile (bool): Whether there are enough tiles to draw one for each player.
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
        self.is_over = False
        self.can_draw_tile = True
        self.num_players = None
        self.is_active = False
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
        self.is_over = False
        self.can_draw_tile = True
        self.num_players = len(self.players)
        self.is_active = False
        self.tiles_remaining = len(self.tiles)

        # Date created
        self.date_created = datetime.datetime.now()

        # Reset player tiles
        for player in self.players:
            self.players[player] = []

        self.divy_out_tiles()

    def __str__(self) -> str:  # pragma: no cover
        return (
            f"ID: {self.id}\n"
            f"Players: {[player for player in self.players]}\n"
            f"Number of Players: {self.num_players}\n"
            f"Is Over?: {self.is_over}\n"
            f"Tiles Remaining: {self.tiles_remaining}\n"
            f"Can draw tile: {self.can_draw_tile}\n"
        )

    def __json__(self) -> Dict[str, Any]:  # pragma: no cover
        return {
            "id": self.id,
            # General game configuration
            "is_over": self.is_over,
            "can_draw_tile": self.can_draw_tile,
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
        if player_id not in self.players:
            self.players[player_id] = []

    def start_game(self):
        """Starts the game by setting the number of players and divvying out tiles.
        """
        self.num_players = len(self.players)
        self.divy_out_tiles()

    def divy_out_tiles(self):
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
        self.is_active = True

    def peel(self):
        """Give a new tile to each player.
        """
        # Give a new tile to each player.
        for player in self.players:
            self.players[player].append(self.tiles.pop())
        self.tiles_remaining = len(self.tiles)

        # See if we there are enough tiles left for another peel
        if self.tiles_remaining < self.num_players:
            self.can_draw_tile = False

    def swap(self, letter, player):
        """Swap a given tile for three tiles for a player.

        Args:
            letter (str): The tile to put back into the pile.
            player (str): The ID of the player to perform the swap.

        Raises:
            GameException: The player does not have an instance of that tile.
        """
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

    def bananagrams(self):
        """End the game (someone has bananagrams)
        """
        self.is_over = True

    def continue_game(self):
        """Continue the game (false alarm on banagrams)
        """
        self.is_over = False
