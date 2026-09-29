/** Shared type vocabulary for diarysetiaphary. */

export type WorldId = 'bedroom' | 'garden' | 'cafe';

export type CharacterId = 'tania' | 'ainat';

/** Relationship stages — never numeric (PRD §44). */
export type RelationshipStage = 'unknown' | 'met' | 'familiar' | 'close';

export type GamePhase = 'title' | 'story' | 'diary' | 'endOfDay';

export interface DiaryEntry {
  id: string;
  /** ISO calendar date, e.g. "2026-09-29" */
  date: string;
  /** Story clock, e.g. "17:12" */
  time: string;
  day: number;
  location: WorldId;
  locationLabel: string;
  characters: CharacterId[];
  /** Auto-generated story context shown above the player's text (PRD §43). */
  context: string;
  /** Free text written by the player. */
  content: string;
}

export interface GameState {
  day: number;
  /** Minutes since midnight on the story clock. */
  minutes: number;
  world: WorldId;
  storyId: string;
  nodeId: string;
  phase: GamePhase;
  /** Character ids whose scene was entered today. */
  visitedToday: CharacterId[];
  relationships: Record<CharacterId, RelationshipStage>;
  /** Free-form story flags set by the engine (small state, not a graph). */
  flags: Record<string, boolean>;
  diary: DiaryEntry[];
  /** True once the player has closed the current day. */
  dayClosed: boolean;
}

export type Predicate = (state: GameState) => boolean;

/** A conditional rewrite of a line; checked top-to-bottom, first match wins. */
export interface LineVariant {
  when: Predicate;
  text: string;
}

export interface StoryOption {
  label: string;
  /** Advance to this node id inside the same story scene. */
  next?: string;
  /** Action string: "openDiary" | "openDiaryHistory" | "showCg:<asset>" | "endDay" | "goTo:<storyId>" */
  action?: string;
  /** Context line seeded into the diary when this option opens it. */
  diaryContext?: string;
  when?: Predicate;
}

interface NodeCommon {
  id: string;
  /** Sets the story clock when the node is shown, "HH:MM". */
  time?: string;
}

export type StoryNode =
  | (NodeCommon & {
      type: 'dialogue';
      character: CharacterId;
      text: string;
      variants?: LineVariant[];
      next?: string;
    })
  | (NodeCommon & {
      type: 'narration' | 'thought';
      text: string;
      variants?: LineVariant[];
      next?: string;
    })
  | (NodeCommon & {
      type: 'system';
      label: string;
      next?: string;
    })
  | (NodeCommon & {
      type: 'choice';
      prompt?: string;
      options: StoryOption[];
    });

export interface StoryScene {
  id: string;
  /** Which Three.js world this scene is staged in. */
  world: WorldId;
  entry: string;
  nodes: StoryNode[];
  /** Applied when the engine loads the scene. */
  onEnter?: {
    time?: string;
    /** Marks a character as visited and bumps their relationship stage. */
    meet?: CharacterId;
  };
}

export function isCharacterId(value: string): value is CharacterId {
  return value === 'tania' || value === 'ainat';
}

export function isWorldId(value: string): value is WorldId {
  return value === 'bedroom' || value === 'garden' || value === 'cafe';
}
