/** Data-driven character definitions (master prompt Â§14 / PRD Â§9, Â§14). */
import type { CharacterId, WorldId } from '../core/types';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  /** Where the player normally finds them. */
  world: WorldId;
  locationLabel: string;
  /** Personality context kept in data, not in rendering code. */
  personality: string;
  /** Painter palette for the character figure. */
  palette: {
    hair: string;
    dress: string;
    accent: string;
    skin: string;
  };
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  tania: {
    id: 'tania',
    name: 'Tania',
    world: 'garden',
    locationLabel: 'Garden',
    personality: 'says things late and quietly, as if testing whether they are safe to say.',
    palette: { hair: '#4A3B2A', dress: '#7C8A73', accent: '#C08B84', skin: '#E5D3BC' },
  },
  ainat: {
    id: 'ainat',
    name: 'Ainat',
    world: 'cafe',
    locationLabel: 'Cafe',
    personality: 'notices small changes in people before they notice them herself.',
    palette: { hair: '#383432', dress: '#7D93A8', accent: '#D8CBA6', skin: '#DFC9AE' },
  },
};

export const PROTAGONIST_PALETTE = {
  hair: '#42392F',
  dress: '#8F8577',
  accent: '#A98B6B',
  skin: '#E7D7C2',
};

/** Whose presence belongs to each location (used by diary context). */
export function charactersAtWorld(world: WorldId): CharacterId[] {
  const owner = (Object.values(CHARACTERS) as CharacterDef[]).find((c) => c.world === world);
  return owner ? [owner.id] : [];
}

export function locationLabelFor(world: WorldId): string {
  if (world === 'bedroom') return 'Bedroom';
  return CHARACTERS[world === 'garden' ? 'tania' : 'ainat'].locationLabel;
}

