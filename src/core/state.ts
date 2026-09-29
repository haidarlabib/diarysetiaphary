/**
 * Centralized game state (PRD §31 / master prompt §9).
 * UI reads state. The story engine and diary system change it
 * through the explicit helpers below.
 */
import type {
  CharacterId,
  DiaryEntry,
  GameState,
  RelationshipStage,
  WorldId,
} from './types';
import { parseClock } from '../utils/time';

function freshState(): GameState {
  return {
    day: 1,
    minutes: 7 * 60 + 20,
    world: 'bedroom',
    storyId: '',
    nodeId: '',
    phase: 'title',
    visitedToday: [],
    relationships: { tania: 'unknown', ainat: 'unknown' },
    flags: {},
    diary: [],
    dayClosed: false,
  };
}

const RELATIONSHIP_ORDER: RelationshipStage[] = ['unknown', 'met', 'familiar', 'close'];

let state: GameState = freshState();

const listeners = new Set<() => void>();

/** Read-only view. Treat the returned object as immutable. */
export function getState(): Readonly<GameState> {
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  for (const listener of listeners) listener();
}

/** Apply a mutation, then notify. Keeps a single source of truth. */
export function update(mutator: (draft: GameState) => void): void {
  const draft: GameState = { ...state };
  mutator(draft);
  state = draft;
  notify();
}

export function setClock(hhmm: string): void {
  const minutes = parseClock(hhmm);
  if (minutes === null) {
    console.error(`[diarysetiaphary] invalid clock string: "${hhmm}" — ignored`);
    return;
  }
  update((draft) => {
    draft.minutes = minutes;
  });
}

export function advanceMinutes(amount: number): void {
  update((draft) => {
    draft.minutes = Math.min(draft.minutes + amount, 23 * 60 + 59);
  });
}

export function goToWorld(world: WorldId): void {
  update((draft) => {
    draft.world = world;
  });
}

export function setStoryPosition(storyId: string, nodeId: string): void {
  update((draft) => {
    draft.storyId = storyId;
    draft.nodeId = nodeId;
  });
}

export function setPhase(phase: GameState['phase']): void {
  update((draft) => {
    draft.phase = phase;
  });
}

export function bumpRelationship(character: CharacterId, target: RelationshipStage): void {
  update((draft) => {
    const current = draft.relationships[character];
    if (RELATIONSHIP_ORDER.indexOf(target) > RELATIONSHIP_ORDER.indexOf(current)) {
      draft.relationships = { ...draft.relationships, [character]: target };
    }
  });
}

export function markVisitedToday(character: CharacterId): void {
  update((draft) => {
    if (!draft.visitedToday.includes(character)) {
      draft.visitedToday = [...draft.visitedToday, character];
    }
  });
}

export function setFlag(flag: string, value = true): void {
  update((draft) => {
    draft.flags = { ...draft.flags, [flag]: value };
  });
}

export function addDiaryEntry(entry: DiaryEntry): void {
  update((draft) => {
    draft.diary = [...draft.diary, entry];
    for (const character of entry.characters) {
      const current = draft.relationships[character];
      if (RELATIONSHIP_ORDER.indexOf(current) < RELATIONSHIP_ORDER.indexOf('familiar')) {
        draft.relationships = { ...draft.relationships, [character]: 'familiar' };
      }
    }
  });
}

/** Load a validated save back into the store. */
export function hydrate(loaded: GameState): void {
  state = loaded;
  notify();
}

/**
 * New game: reset all run state. Diary history is kept unless the player
 * explicitly confirms a full clear — see `startNewRun`.
 */
export function startNewRun(clearDiary: boolean): void {
  const carriedDiary = clearDiary ? [] : state.diary;
  state = freshState();
  state.diary = carriedDiary;
  notify();
}

/** Called when the player closes a day: the next continue opens a new morning. */
export function closeCurrentDay(): void {
  update((draft) => {
    draft.dayClosed = true;
  });
}

export function openNewMorning(): void {
  update((draft) => {
    draft.day = draft.dayClosed ? draft.day + 1 : draft.day;
    draft.minutes = 7 * 60 + 20;
    draft.world = 'bedroom';
    draft.storyId = '';
    draft.nodeId = '';
    draft.visitedToday = [];
    draft.dayClosed = false;
    draft.phase = 'story';
  });
}
