import type { CharacterId, StoryNode, StoryOption, StoryScene, WorldId } from '../core/types';
import { bumpRelationship, getState, goToWorld, markVisitedToday, setClock, setPhase, setStoryPosition } from '../core/state';
import { STORY_SCENES } from '../story/registry';

export interface StoryEngineHandlers {
  onNode(node: StoryNode, text: string): void;
  onChoice(node: Extract<StoryNode, { type: 'choice' }>, options: StoryOption[]): void;
  onOpenDiary(context?: string): void;
  onShowCg(asset: string, next?: string): void;
  onEndDay(): void;
  onSceneChange(world: WorldId): void;
}

export class StoryEngine {
  private scene: StoryScene | null = null;
  private node: StoryNode | null = null;

  public constructor(private readonly handlers: StoryEngineHandlers) {}

  public play(sceneId: string, nodeId?: string): boolean {
    const scene = STORY_SCENES[sceneId];
    if (!scene) {
      console.error(`[diarysetiaphary] unknown story scene: ${sceneId}`);
      return false;
    }
    this.scene = scene;
    goToWorld(scene.world);
    setPhase('story');
    if (scene.onEnter?.time) setClock(scene.onEnter.time);
    if (scene.onEnter?.meet) this.meet(scene.onEnter.meet);
    this.handlers.onSceneChange(scene.world);
    return this.show(nodeId ?? scene.entry);
  }

  public currentNode(): StoryNode | null {
    return this.node;
  }

  public rerender(): void {
    if (this.node) this.present(this.node);
  }

  public advance(): void {
    const node = this.node;
    if (!node || node.type === 'choice') return;
    const next = 'next' in node && node.next ? node.next : this.nextLinearId(node.id);
    if (next) this.show(next);
  }

  public choose(option: StoryOption): void {
    if (option.action === 'openDiary') {
      this.handlers.onOpenDiary(option.diaryContext);
      return;
    }
    if (option.action === 'endDay') {
      this.handlers.onEndDay();
      return;
    }
    if (option.action?.startsWith('showCg:')) {
      this.handlers.onShowCg(option.action.slice('showCg:'.length), option.next);
      return;
    }
    if (option.action?.startsWith('goTo:')) {
      this.play(option.action.slice('goTo:'.length));
      return;
    }
    if (option.next) this.show(option.next);
  }

  private show(nodeId: string): boolean {
    if (!this.scene) return false;
    const node = this.scene.nodes.find((candidate) => candidate.id === nodeId);
    if (!node) {
      console.error(`[diarysetiaphary] missing node ${this.scene.id}/${nodeId}`);
      return false;
    }
    this.node = node;
    setStoryPosition(this.scene.id, node.id);
    if (node.time) setClock(node.time);
    this.present(node);
    return true;
  }

  private present(node: StoryNode): void {
    if (node.type === 'choice') {
      const options = node.options.filter((option) => option.when?.(this.state()) ?? true);
      this.handlers.onChoice(node, options);
      return;
    }
    const text = 'text' in node ? this.resolveText(node) : node.label;
    this.handlers.onNode(node, text);
  }

  private resolveText(node: Extract<StoryNode, { text: string }>): string {
    const variant = node.variants?.find((candidate) => candidate.when(this.state()));
    return variant?.text ?? node.text;
  }

  private nextLinearId(id: string): string | undefined {
    if (!this.scene) return undefined;
    const index = this.scene.nodes.findIndex((node) => node.id === id);
    return index >= 0 ? this.scene.nodes[index + 1]?.id : undefined;
  }

  private meet(character: CharacterId): void {
    markVisitedToday(character);
    bumpRelationship(character, 'met');
  }

  private state() {
    return getState();
  }
}
