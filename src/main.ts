import './ui/styles.css';
import { closeCurrentDay, getState, hydrate, openNewMorning, setPhase, startNewRun, subscribe } from './core/state';
import { hasSave, loadSave, saveNow } from './core/persistence';
import { validateStoryRegistry } from './story/registry';
import { StoryEngine } from './engine/storyEngine';
import { ThreeWorld } from './renderer/threeWorld';
import { DiaryUI } from './diary/diaryUI';
import { Views } from './ui/views';

const root = document.querySelector<HTMLElement>('#ui');
const canvas = document.querySelector<HTMLCanvasElement>('#world');
const veil = document.querySelector<HTMLElement>('#veil');

if (!root || !canvas || !veil) throw new Error('diarysetiaphary root elements are missing');

const errors = validateStoryRegistry();
errors.forEach((error) => console.error(`[diarysetiaphary] ${error}`));

let world: ThreeWorld | null = null;
try { world = new ThreeWorld(canvas); world.start(); } catch (error) {
  console.error('[diarysetiaphary] WebGL unavailable', error);
  canvas.style.display = 'none';
}

const views = new Views(root, () => { if (app.engine.currentNode()?.type !== 'choice') app.engine.advance(); }, (option) => app.engine.choose(option));
const diary = new DiaryUI(views);

const transition = async (run: () => void): Promise<void> => {
  veil.classList.add('show');
  await new Promise((resolve) => window.setTimeout(resolve, 300));
  run();
  await new Promise((resolve) => window.setTimeout(resolve, 40));
  veil.classList.remove('show');
};

const app = {
  engine: null as unknown as StoryEngine,
  showTitle(): void {
    setPhase('title');
    views.title(hasSave(), getState().diary.length > 0, () => {
      const state = getState();
      if (state.dayClosed) { openNewMorning(); void this.go('bedroom_morning'); }
      else if (state.storyId) void this.go(state.storyId, state.nodeId);
      else void this.go('bedroom_morning');
    }, (clearDiary) => { startNewRun(clearDiary); openNewMorning(); void this.go('bedroom_morning'); }, () => diary.history(() => this.showTitle()));
  },
  async go(scene: string, node?: string): Promise<void> {
    await transition(() => { this.engine.play(scene, node); });
  },
  openDiary(context = 'A blank page, waiting for the day to begin.'): void {
    diary.write(context, () => { setPhase('story'); this.engine.rerender(); });
  },
  endDay(): void {
    const state = getState();
    const summary = state.diary.length ? 'something worth keeping.' : state.visitedToday.length > 1 ? 'two small conversations.' : 'quiet.';
    diary.end(summary, () => { closeCurrentDay(); saveNow(getState()); this.showTitle(); });
  },
  showCg(asset: string, next?: string): void {
    setPhase('story');
    views.cg(asset, () => { if (next) void this.go(getState().storyId, next); else this.engine.rerender(); });
  },
};

app.engine = new StoryEngine({
  onNode: (node, text) => {
    const stage = views.story(getState().day, getState().minutes, () => views.menu(() => app.engine.rerender(), () => diary.history(() => app.showTitle()), () => app.showTitle()));
    views.renderNode(stage.dialogue, stage.choices, node, text);
  },
  onChoice: (node, options) => {
    const stage = views.story(getState().day, getState().minutes, () => views.menu(() => app.engine.rerender(), () => diary.history(() => app.showTitle()), () => app.showTitle()));
    views.renderNode(stage.dialogue, stage.choices, node, '', options);
  },
  onOpenDiary: (context) => app.openDiary(context),
  onShowCg: (asset, next) => app.showCg(asset, next),
  onEndDay: () => app.endDay(),
  onSceneChange: (sceneWorld) => { world?.load(sceneWorld, getState().minutes); },
});

const saved = loadSave();
if (saved) hydrate(saved);
subscribe(() => {
  const state = getState();
  if (state.storyId !== '' || state.dayClosed || state.diary.length > 0) saveNow(state);
  if (world && state.phase === 'story') world.load(state.world, state.minutes);
});
world?.load('bedroom', getState().minutes);
app.showTitle();

window.addEventListener('keydown', (event) => {
  if (event.key === ' ' && getState().phase === 'story') { event.preventDefault(); if (app.engine.currentNode()?.type !== 'choice') app.engine.advance(); }
  if (event.key === 'Escape' && getState().phase === 'story') {
    views.menu(() => app.engine.rerender(), () => diary.history(() => app.showTitle()), () => app.showTitle());
  }
});

window.addEventListener('beforeunload', () => {
  const state = getState();
  if (state.phase !== 'title' || state.dayClosed || state.diary.length > 0) saveNow(state);
  world?.destroy();
});
