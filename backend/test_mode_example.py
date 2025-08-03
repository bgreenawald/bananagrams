#!/usr/bin/env python3
"""
Example script demonstrating the test mode functionality.

This script shows how to use the test mode for quick testing of the game flow
with minimal tiles and single player support.
"""

from game import Game


def main():
    print("=== Bananagrams Test Mode Example ===\n")

    # Create a test mode game
    print("1. Creating a test mode game...")
    test_game = Game("test-demo", test_mode=True)
    print(f"   - Game ID: {test_game.id}")
    print(f"   - Test mode: {test_game.test_mode}")
    print(f"   - Total tiles: {len(test_game.tiles)}")
    print(f"   - Game state: {test_game.state}")
    print()

    # Join a single player (only allowed in test mode)
    print("2. Joining a single player...")
    test_game.join_game("test-player")
    print(f"   - Players: {list(test_game.players.keys())}")
    print(f"   - Number of players: {len(test_game.players)}")
    print()

    # Start the game with single player
    print("3. Starting the game...")
    test_game.start_game()
    print(f"   - Game state: {test_game.state}")
    print(f"   - Player tiles count: {len(test_game.players['test-player'])}")
    print(f"   - Tiles remaining: {test_game.tiles_remaining}")
    print(f"   - Player tiles: {test_game.players['test-player']}")
    print()

    # Demonstrate peel functionality
    print("4. Testing peel functionality...")
    original_tile_count = len(test_game.players["test-player"])
    test_game.peel(test=True)
    new_tile_count = len(test_game.players["test-player"])
    print(f"   - Tiles before peel: {original_tile_count}")
    print(f"   - Tiles after peel: {new_tile_count}")
    print(f"   - Tiles remaining: {test_game.tiles_remaining}")
    print()

    # Compare with regular game
    print("5. Comparing with regular game...")
    regular_game = Game("regular-demo", test_mode=False)
    print(f"   - Regular game tiles: {len(regular_game.tiles)}")
    print(
        f"   - Test game tiles: {len(test_game.tiles) + sum(len(tiles) for tiles in test_game.players.values())}"
    )

    # Try to start regular game with single player (should fail)
    regular_game.join_game("single-player")
    try:
        regular_game.start_game()
        print("   - ERROR: Regular game should not allow single player!")
    except Exception as e:
        print(f"   - Regular game correctly prevents single player: {e}")

    print("\n=== Test Mode Demo Complete ===")


if __name__ == "__main__":
    main()
