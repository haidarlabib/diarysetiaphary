/**
 * Local persistence (PRD §32). Backend not needed for the prototype.
 * Invalid or malformed saves reset to a known-good state (PRD §19).
 */
import type { DiaryEntry, GameState, RelationshipStage, WorldId } from './types';
import { isCharacterId, isWorldId } from './types';

const SAVE_KEY = 'diarysetiaphary.save.v1';
const SAVE_VERSION = 1;

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function storage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function validateEntry(raw: unknown): DiaryEntry | null {
  if (!isRecord(raw)) return null;
  const id = readString(raw.id);
  const date = readString(raw.date);
  const time = readString(raw.time);
  const day = readNumber(raw.day);
  const location = readString(raw.location);
  const locationLabel = readString(raw.locationLabel);
  const context = readString(raw.context);
  const content = readString(raw.content);
  if (id === null || date === null || time === null || day === null) return null;
  if (location === null || !isWorldId(location)) return null;
  if (locationLabel === null || context === null || content === null) return null;
  if (!Array.isArray(raw.characters) || !raw.characters.every(isCharacterId)) return null;
  return {
    id,
    date,
    time,
    day,
    location,
    locationLabel,
    context,
    content,
    characters: raw.characters as DiaryEntry['characters'],
  };
}

const STAGES: RelationshipStage[] = ['unknown', 'met', 'familiar', 'close'];

function readStage(value: unknown): RelationshipStage {
  return STAGES.includes(value as RelationshipStage)
    ? (value as RelationshipStage)
    : 'unknown';
}

/** Returns null when the save is absent or untrustworthy. */
export function loadSave(): GameState | null {
  const store = storage();
  if (!store) return null;
  const raw = store.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== SAVE_VERSION) return null;
    const data = parsed.state;
    if (!isRecord(data)) return null;

    const day = readNumber(data.day);
    const minutes = readNumber(data.minutes);
    const world = readString(data.world);
    const storyId = readString(data.storyId);
    const nodeId = readString(data.nodeId);
    const phase = readString(data.phase);
    const dayClosed = typeof data.dayClosed === 'boolean' ? data.dayClosed : null;
    if (
      day === null ||
      day < 1 ||
      minutes === null ||
      minutes < 0 ||
      minutes > 23 * 60 + 59 ||
      world === null ||
      !isWorldId(world) ||
      storyId === null ||
      nodeId === null ||
      phase === null ||
      !['title', 'story', 'diary', 'endOfDay'].includes(phase) ||
      dayClosed === null
    ) {
      throw new Error('state fields failed validation');
    }

    const relationships = isRecord(data.relationships) ? data.relationships : {};
    const visited = Array.isArray(data.visitedToday)
      ? data.visitedToday.filter(isCharacterId)
      : [];
    const flags: Record<string, boolean> = {};
    if (isRecord(data.flags)) {
      for (const [key, value] of Object.entries(data.flags)) {
        if (typeof value === 'boolean') flags[key] = value;
      }
    }
    const rawDiary = Array.isArray(data.diary) ? data.diary : [];
    const diary: DiaryEntry[] = [];
    for (const rawEntry of rawDiary) {
      const entry = validateEntry(rawEntry);
      if (entry !== null) diary.push(entry);
    }

    return {
      day,
      minutes,
      world: world as WorldId,
      storyId,
      nodeId,
      phase: phase as GameState['phase'],
      visitedToday: visited,
      relationships: {
        tania: readStage(relationships.tania),
        ainat: readStage(relationships.ainat),
      },
      flags,
      diary,
      dayClosed,
    };
  } catch (error) {
    console.warn('[diarysetiaphary] saved state invalid — resetting', error);
    clearSave();
    return null;
  }
}

export function saveNow(state: Readonly<GameState>): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, state }));
  } catch (error) {
    console.warn('[diarysetiaphary] save failed', error);
  }
}

export function clearSave(): void {
  storage()?.removeItem(SAVE_KEY);
}

export function hasSave(): boolean {
  return storage() !== null && storage()?.getItem(SAVE_KEY) != null;
}
