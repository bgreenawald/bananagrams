import { GameEffects } from './game.effect';
import { UserEffects } from './user.effect'; // RENAME?: a better name might be - user triggered effects? user events?

export const effects: any[] = [GameEffects, UserEffects];

export * from './game.effect';