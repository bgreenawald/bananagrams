import time
import unittest

from game import Game, GameException, State


class testGameMethods(unittest.TestCase):
    def test_init(self):
        g = Game("")

        # Check that the correct number of tiles were dealt
        self.assertEqual(len(g.tiles), 144)

    def test_reset(self):
        g = Game("")
        ids = [f"id_{x}" for x in range(2)]
        for id_ in ids:
            g.join_game(id_)
        g.start_game()
        with self.subTest("Check players have tiles before reset"):
            print(g)
            self.assertTrue(all(len(g.players[id_]) == 21 for id_ in ids))
        with self.subTest("Check players can't join before reset."):
            try:
                g.join_game("id_2")
            except GameException:
                pass
            else:
                self.fail()
        with self.subTest("Test game state before reset."):
            self.assertEqual(g.state, State.ACTIVE)

        g.reset()
        with self.subTest("Check number of players set to None."):
            self.assertEqual(g.num_players, None)
        with self.subTest("Check players have no tiles after reset"):
            self.assertTrue(all(g.players[id_] == [] for id_ in ids))
        g.join_game("id_2")
        with self.subTest("Check players can join after reset."):
            self.assertEqual(len(g.players), 3)
        with self.subTest("Test game state after reset."):
            self.assertEqual(g.state, State.IDLE)

    def test_join_player(self):
        g = Game("")

        with self.subTest("Test number of players empty."):
            self.assertEqual(g.num_players, None)
        with self.subTest("Test length of player array empty."):
            self.assertEqual(len(g.players), 0)

        g.join_game("id_1")
        with self.subTest("Test length of player array (1)."):
            self.assertEqual(len(g.players), 1)

        g.join_game("id_1")
        with self.subTest("Test length of player array duplicate (1)."):
            self.assertEqual(len(g.players), 1)

        g.join_game("id_2")
        with self.subTest("Test length of player array (2)."):
            self.assertEqual(len(g.players), 2)

        g.start_game()
        with self.subTest("Test exception joining after game has started"):
            try:
                g.join_game("id_3")
            except GameException:
                pass
            else:
                self.fail()

        g = Game("")
        for i in range(8):
            g.join_game(f"id_{i}")

        with self.subTest("Test adding after maximum player."):
            try:
                g.join_game("id_8")
            except GameException:
                pass
            else:
                self.fail()

    def test_start_game(self):
        g = Game("")
        g.join_game("id_0")
        with self.subTest("Test start with too few players."):
            try:
                g.start_game()
            except GameException:
                pass
            else:
                self.fail()

        g = Game("")
        ids = [f"id_{x}" for x in range(2)]
        for id_ in ids:
            g.join_game(id_)
        g.start_game()
        with self.subTest("Test divy tiles with 2 players."):
            print(g)
            self.assertTrue(all(len(g.players[id_]) == 21 for id_ in ids))
        with self.subTest("Test number of players set after starting game (2)."):
            self.assertEqual(g.num_players, 2)

        g = Game("")
        ids = [f"id_{x}" for x in range(5)]
        for id_ in ids:
            g.join_game(id_)
        g.start_game()
        with self.subTest("Test divy tiles with 5 players."):
            print(g)
            self.assertTrue(all(len(g.players[id_]) == 15 for id_ in ids))
        with self.subTest("Test number of players set after starting game (5)."):
            self.assertEqual(g.num_players, 5)

        g = Game("")
        ids = [f"id_{x}" for x in range(7)]
        for id_ in ids:
            g.join_game(id_)
        g.start_game()
        with self.subTest("Test divy tiles with 7 players."):
            print(g)
            self.assertTrue(all(len(g.players[id_]) == 11 for id_ in ids))
        with self.subTest("Test number of players set after starting game (7)."):
            self.assertEqual(g.num_players, 7)

        g = Game("")
        ids = [f"id_{x}" for x in range(5)]
        for id_ in ids:
            g.join_game(id_)
        with self.subTest("Test state before starting game."):
            self.assertEqual(g.state, State.IDLE)

        g.start_game()
        with self.subTest("Test state after starting game"):
            self.assertEqual(g.state, State.ACTIVE)

        with self.subTest("Test cannot start game twice."):
            try:
                g.start_game()
            except GameException:
                pass
            else:
                self.fail()

    def test_peel(self):
        g = Game("")
        ids = [f"id_{x}" for x in range(2)]
        for id_ in ids:
            g.join_game(id_)
        with self.subTest("Test peel invalid state 'IDLE'"):
            try:
                g.peel(test=True)
            except GameException:
                pass
            else:
                self.fail()

        g.start_game()
        with self.subTest("Test tile numbers before peel."):
            self.assertTrue(all(len(g.players[id_]) == 21 for id_ in ids))
        time.sleep(1)
        g.peel(test=True)
        with self.subTest("Test tile numbers before peel."):
            self.assertTrue(all(len(g.players[id_]) == 22 for id_ in ids))
        with self.subTest("Test number of tiles updated correctly."):
            self.assertEqual(g.tiles_remaining, 100)
        with self.subTest("Test peel too frequently."):
            try:
                g.peel()
            except GameException:
                pass
            else:
                self.fail()

        for _ in range((g.tiles_remaining // g.num_players) - 1):
            g.peel(test=True)
        g.peel(test=True)
        with self.subTest("Test game transition to Endgame."):
            self.assertEqual(g.state, State.ENDGAME)

        with self.subTest("Test peel with insufficient tiles."):
            try:
                g.peel(test=True)
            except GameException:
                pass
            else:
                self.fail()

        g = Game("")
        ids = [f"id_{x}" for x in range(2)]
        for id_ in ids:
            g.join_game(id_)
        g.start_game()
        for _ in range((g.tiles_remaining // g.num_players) - 1):
            g.peel(test=True)
        g.players["id_3"] = []
        g.num_players = len(g.players)
        with self.subTest("Try peel with too many players."):
            try:
                g.peel(test=True)
            except GameException:
                pass
            else:
                self.fail()

    def test_swap(self):
        g = Game("")
        ids = [f"id_{x}" for x in range(2)]
        for id_ in ids:
            g.join_game(id_)
        with self.subTest("Test swap from invalid state 'IDLE'"):
            try:
                g.swap("A", "id_0")
            except GameException:
                pass
            else:
                self.fail()

        g.start_game()
        g.players["id_0"] = ["A", "B", "C"]
        with self.subTest("Remove an invalid letter."):
            try:
                g.swap("D", "id_0")
            except GameException:
                pass
            else:
                self.fail()

        g = Game("")
        ids = [f"id_{x}" for x in range(2)]
        for id_ in ids:
            g.join_game(id_)
        g.start_game()
        g.swap(g.players["id_0"][0], "id_0")
        with self.subTest("See if the letter length is correct for swap player."):
            self.assertEqual(len(g.players["id_0"]), 23)
        with self.subTest("See if the letter length is correct for non-swap player."):
            self.assertEqual(len(g.players["id_1"]), 21)
        with self.subTest("See if the tiles remaining is correct."):
            self.assertEqual(g.tiles_remaining, 100)

        for _ in range((g.tiles_remaining // g.num_players) - 1):
            g.peel(test=True)

        with self.subTest("Test state not endgame pre-insufficient swap."):
            self.assertNotEqual(g.state, State.ENDGAME)
        prev_player_tiles = len(g.players["id_0"])
        player_tile = g.players["id_0"][0]
        g.swap(player_tile, "id_0")
        with self.subTest("Test state in endgame after insufficient-swap"):
            self.assertEqual(g.state, State.ENDGAME)
        with self.subTest("Test that player got all remaining new tiles."):
            self.assertEqual(len(g.players["id_0"]) - prev_player_tiles, 1)
        with self.subTest("Make sure player tile still put on deck"):
            self.assertEqual([player_tile], g.tiles)

        with self.subTest("Test swap in state 'ENDGAME'"):
            try:
                g.swap(g.players["id_0"][0], "id_0")
            except GameException:
                self.fail()

    def test_bananagrams(self):
        g = Game("")
        ids = [f"id_{x}" for x in range(2)]
        for id_ in ids:
            g.join_game(id_)
        g.start_game()
        for _ in range((g.tiles_remaining // g.num_players) - 1):
            g.peel(test=True)

        with self.subTest("Test bananagrams from invalid state 'Active'"):
            try:
                g.bananagrams("winning_player", ["winning", "words"])
            except GameException:
                pass
            else:
                self.fail()
        with self.subTest("Test winning player empty before game over."):
            self.assertEqual(g.winning_player, None)
        with self.subTest("Test winning tiles empty before game over."):
            self.assertEqual(g.winning_words, None)

        g.peel(test=True)
        g.bananagrams("winning_player", ["winning", "words", "xdefx"])

        with self.subTest("Test game in over state."):
            self.assertEqual(g.state, State.OVER)
        with self.subTest("Test winning player after game over."):
            self.assertEqual(g.winning_player, "winning_player")
        with self.subTest("Test winning tiles after game over."):
            self.assertEqual(
                g.winning_words, [("winning", True), ("words", True), ("xdefx", False)]
            )

    def test_continue(self):
        g = Game("")
        ids = [f"id_{x}" for x in range(2)]
        for id_ in ids:
            g.join_game(id_)
        g.start_game()
        for _ in range((g.tiles_remaining // g.num_players) - 1):
            g.peel(test=True)

        g.peel(test=True)
        with self.subTest("Test continue from invalid state 'ENDGAME'"):
            try:
                g.continue_game()
            except GameException:
                pass
            else:
                self.fail()

        g.bananagrams("player_id", ["winning", "words", "xdefx"])
        g.continue_game()

        with self.subTest("Test game in endgame state."):
            self.assertEqual(g.state, State.ENDGAME)
        with self.subTest("Test winning player reset."):
            self.assertEqual(g.winning_player, None)
        with self.subTest("Test winning words reset."):
            self.assertEqual(g.winning_words, None)

    def test_test_mode(self):
        # Test regular game initialization
        g_regular = Game("regular")
        with self.subTest("Test regular game has full tile set"):
            self.assertEqual(len(g_regular.tiles), 144)
        with self.subTest("Test regular game test_mode flag"):
            self.assertFalse(g_regular.test_mode)

        # Test test mode game initialization
        g_test = Game("test", test_mode=True)
        with self.subTest("Test mode game has minimal tiles"):
            self.assertEqual(len(g_test.tiles), 10)
        with self.subTest("Test test mode flag is set"):
            self.assertTrue(g_test.test_mode)

        # Test single player start in test mode
        g_test.join_game("single_player")
        with self.subTest("Test single player can start in test mode"):
            try:
                g_test.start_game()
            except GameException:
                self.fail("Should allow single player start in test mode")
            else:
                pass

        with self.subTest("Test player gets fewer tiles in test mode"):
            self.assertEqual(len(g_test.players["single_player"]), 7)

        with self.subTest("Test game state transitions correctly in test mode"):
            self.assertEqual(g_test.state, State.ACTIVE)

        # Test that regular game still requires 2+ players
        g_regular.join_game("single_player")
        with self.subTest("Test regular game still requires 2+ players"):
            try:
                g_regular.start_game()
            except GameException:
                pass
            else:
                self.fail("Regular game should require at least 2 players")

        # Test reset maintains test mode
        g_test.reset()
        with self.subTest("Test reset maintains test mode tiles count"):
            self.assertEqual(len(g_test.tiles), 10)
        with self.subTest("Test reset maintains test mode flag"):
            self.assertTrue(g_test.test_mode)
