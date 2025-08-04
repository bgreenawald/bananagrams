import datetime
import random
from enum import Enum
from threading import Lock
from typing import Any, Dict, List

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

# Read in the word list
with open("words/words.txt", "r") as file:
    WORDS = set([x.strip() for x in file.readlines()])


class State(Enum):
    """Defines the current state of a turn."""

    # Waiting for players to join the game
    IDLE = "IDLE"

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
        last_peel (datetime.datetime): The time of the last peel, used to prevent overlapping peels.
        winning_words (List[Tuple[str, bool]]): List of words from the (potentially) winning player
        winning_player (str): ID of the (potentially) winning player
        lock (threading.Lock): A lock to keep the game state synchronized.

    """

    def __init__(self, id: str, test_mode: bool = False):
        self.id: str = id
        self.test_mode: bool = test_mode

        # Tile generation
        self.tiles = self._generate_tiles()
        random.shuffle(self.tiles)

        # General game fields
        self.state = State.IDLE
        self.num_players = None
        self.tiles_remaining = len(self.tiles)
        self.last_peel = datetime.datetime.now()

        # Date created.
        self.date_created = datetime.datetime.now()

        # Player tile tracking
        self.players = {}

        # Data for the end of the game
        self.winning_words = None
        self.winning_player = None

        # Lock for synchronization
        self.lock = Lock()

    def _generate_tiles(self) -> List[str]:
        """Generate the initial set of tiles for the game.

        Returns:
            List[str]: List of tiles for the game.
        """
        tiles = []
        if self.test_mode:
            # For test mode, use a minimal set of tiles for quick testing
            test_tiles = [
                "A",
                "E",
                "T",
                "S",
                "R",
                "N",
                "O",
                "I",
                "L",
                "C",
            ]
            tiles = test_tiles.copy()
        else:
            for count, letters in TILE_FREQUENCIES.items():
                for letter in letters:
                    for _ in range(count):
                        tiles.append(letter)
        return tiles

    def reset(
        self,
    ):
        # Tile generation
        self.tiles = self._generate_tiles()
        random.shuffle(self.tiles)

        # General game fields
        self.state = State.IDLE
        self.num_players = None
        self.tiles_remaining = len(self.tiles)

        # Date created
        self.date_created = datetime.datetime.now()

        # Reset end of game data
        self.winning_words = None
        self.winning_player = None

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
            # End of game
            "winning_words": self.winning_words,
            "winning_player": self.winning_player,
        }

    for_json = __json__

    def join_game(self, player_id: str):
        """Add a player to the players roster.

        Args:
            player_id (str): The ID of the player to add.
        """
        if not self.lock.acquire(timeout=2):
            raise GameException("Could not acquire game lock - operation timed out")
        try:
            num_players = len(self.players)
            if num_players == 8:
                raise GameException("Maximum number of player reached.")

            if self.state != State.IDLE:
                raise GameException(
                    f"Cannot add players, game state is {self.state}. Should be 'IDLE'"
                )
            if player_id not in self.players:
                self.players[player_id] = []
        finally:
            self.lock.release()

    def start_game(self):
        """Starts the game by setting the number of players and divvying out tiles."""
        if not self.lock.acquire(timeout=2):
            raise GameException("Could not acquire game lock - operation timed out")
        try:
            if self.state != State.IDLE:
                raise GameException(
                    f"Cannot start game, game state is {self.state}. Should be 'IDLE'"
                )
            else:
                self.num_players = len(self.players)
                # In test mode, allow single player games
                if not self.test_mode and self.num_players < 2:
                    raise GameException("Need at least 2 players to start a game")
                self._divy_out_tiles()
                self.state = State.ACTIVE
        finally:
            self.lock.release()

    def _divy_out_tiles(self):
        """Divy out the correct number of tiles to each player.

        Raises:
            GameException: Invalid number of players.
        """
        # In test mode, give fewer tiles for quick testing
        if self.test_mode:
            num_tiles = 7  # Small number for quick testing
        else:
            # Give out number of tiles based on number of players
            if 2 <= self.num_players <= 4:
                num_tiles = 21
            elif 5 <= self.num_players <= 6:
                num_tiles = 15
            elif 7 <= self.num_players <= 8:
                num_tiles = 11
            else:
                raise GameException("Invalid number of players.")

        for player in self.players:
            for _ in range(num_tiles):
                if len(self.tiles) == 0:
                    raise GameException("Not enough tiles available to distribute to all players")
                self.players[player].append(self.tiles.pop())

        self.tiles_remaining = len(self.tiles)

    def peel(self, test: bool = False):
        """
        Give a new tile to each player.

        Args:
            test (bool): Bypasses the time restriction for testing, defaults to False.
        """
        if not self.lock.acquire(timeout=2):
            raise GameException("Could not acquire game lock - operation timed out")
        try:
            if self.state != State.ACTIVE:
                raise GameException(f"Cannot peel, game state is {self.state}. Should be 'ACTIVE'")
            else:
                # Make sure a peel hasn't happened within a fraction of a second to prevent overlap
                if (datetime.datetime.now() - self.last_peel).total_seconds() <= 0.75 and not test:
                    raise GameException("Peel occuring too frequently.")

                # Update the time of the last peel
                self.last_peel = datetime.datetime.now()

                # Make sure there are enough tiles to make a peel.
                if self.num_players > self.tiles_remaining:
                    raise GameException("Not enough tiles to deal.")

                # Check if this peel will transition to endgame
                will_be_endgame = (self.tiles_remaining - self.num_players) < self.num_players

                # Give a new tile to each player.
                for player in self.players:
                    self.players[player].append(self.tiles.pop())
                self.tiles_remaining = len(self.tiles)

                # Update state if necessary
                if will_be_endgame:
                    self.state = State.ENDGAME

        finally:
            self.lock.release()

    def swap(self, letter, player):
        """Swap a given tile for three tiles for a player.

        Args:
            letter (str): The tile to put back into the pile.
            player (str): The ID of the player to perform the swap.

        Raises:
            GameException: The player does not have an instance of that tile.
        """
        if not self.lock.acquire(timeout=2):
            raise GameException("Could not acquire game lock - operation timed out")
        try:
            if self.state not in [State.ACTIVE, State.ENDGAME]:
                raise GameException(
                    f"Cannot swap, game state is {self.state}. Should be 'ACTIVE' or 'ENDGAME'"
                )
            else:
                if letter not in self.players[player]:
                    raise GameException("Player does not have this letter to remove.")

                # Check if this swap will transition to endgame
                tiles_to_give = min(3, self.tiles_remaining)
                will_be_endgame = (self.tiles_remaining - tiles_to_give + 1) < self.num_players

                # Add new tiles to the player
                for _ in range(tiles_to_give):
                    self.players[player].append(self.tiles.pop())

                # Remove one instance of the given letter from the player
                self.players[player].remove(letter)

                # Add the letter back to the tile pile and shuffle
                self.tiles.append(letter)
                random.shuffle(self.tiles)

                # Update number of tiles
                self.tiles_remaining = len(self.tiles)

                # Update state if necessary
                if will_be_endgame:
                    self.state = State.ENDGAME
        finally:
            self.lock.release()

    def bananagrams(self, player_id: str, word_list: List[str]):
        """
        End the game (someone has bananagrams)

        Args:
            player_id (str): The ID of the potentially winning player.
            word_list (List[str]): The list of the winning words.
        """
        if not self.lock.acquire(timeout=2):
            raise GameException("Could not acquire game lock - operation timed out")
        try:
            winning_words = []
            if self.state != State.ENDGAME:
                raise GameException(
                    f"Cannot call bananagrams, game state is {self.state}. Should be 'ENDGAME'"
                )
            else:
                self.state = State.OVER
            self.winning_player = player_id

            # Iterate over the winning words and check each against the dictionary
            for word in word_list:
                winning_words.append((word, word.upper() in WORDS))
            self.winning_words = winning_words
        finally:
            self.lock.release()

    def continue_game(self):
        """Continue the game (false alarm on banagrams)"""
        if not self.lock.acquire(timeout=2):
            raise GameException("Could not acquire game lock - operation timed out")
        try:
            if self.state != State.OVER:
                raise GameException(
                    f"Cannot continue game, game state is {self.state}. Should be 'OVER'"
                )
            else:
                self.state = State.ENDGAME
                self.winning_player = None
                self.winning_words = None
        finally:
            self.lock.release()

    def change_player_id(self, old_id: str, new_id: str):
        """Change a player ID.

        Args:
            old_id (str): The old player ID.
            new_id (str): The new player ID.

        Raises:
            GameException: The old player ID does not exist.
            GameException: The new player ID already exists.

        """
        self.lock.acquire(timeout=2)

        try:
            if old_id not in self.players:
                raise GameException("Update player ID failed, old ID does not exist.")
            if new_id in self.players:
                raise GameException("Update player ID failed, new ID already exists.")
            self.players[new_id] = self.players.pop(old_id)
        finally:
            self.lock.release()
