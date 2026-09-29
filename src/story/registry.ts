import type { StoryScene } from '../core/types';
import { bedroomMorning } from './day01/bedroomMorning';
import { cafe } from './day01/cafe';
import { bedroomEvening, bedroomLate, cafeEvening, gardenEvening } from './day01/evening';
import { garden } from './day01/garden';

export const STORY_SCENES: Record<string, StoryScene> = Object.fromEntries(
  [bedroomMorning, garden, cafe, bedroomEvening, gardenEvening, cafeEvening, bedroomLate].map((scene) => [scene.id, scene]),
);

export function validateStoryRegistry(): string[] {
  const errors: string[] = [];
  for (const scene of Object.values(STORY_SCENES)) {
    const ids = new Set(scene.nodes.map((node) => node.id));
    if (!ids.has(scene.entry)) errors.push(`${scene.id}: missing entry node ${scene.entry}`);
    for (const node of scene.nodes) {
      const next = 'next' in node ? node.next : undefined;
      if (next !== undefined && !ids.has(next)) errors.push(`${scene.id}/${node.id}: missing next ${next}`);
      if (node.type !== 'choice') continue;
      for (const option of node.options) {
        if (option.next !== undefined && !ids.has(option.next)) {
          errors.push(`${scene.id}/${node.id}: missing choice next ${option.next}`);
        }
        if (option.action?.startsWith('goTo:')) {
          const target = option.action.slice('goTo:'.length);
          if (!STORY_SCENES[target]) errors.push(`${scene.id}/${node.id}: missing scene ${target}`);
        }
      }
    }
  }
  return errors;
}
