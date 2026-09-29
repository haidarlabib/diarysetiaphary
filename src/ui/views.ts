import type { StoryNode, StoryOption } from '../core/types';
import { clear, el } from '../utils/dom';
import { calendarLabels, daypart, formatClock, ordinalWord } from '../utils/time';

export class Views {
  public constructor(private readonly root: HTMLElement, private readonly onAdvance: () => void, private readonly onPick: (option: StoryOption) => void) {}
  public title(hasSave: boolean, hasDiary: boolean, onContinue: () => void, onNew: (clear: boolean) => void, onDiary: () => void): void {
    clear(this.root); const view = el('section','view title');
    view.append(el('div','wordmark','diarysetiaphary'), el('p','tagline','a little place\nfor everyday stories'));
    const actions = el('div','actions');
    if (hasSave) actions.append(this.button('CONTINUE', onContinue, true));
    actions.append(this.button('NEW DAY', () => onNew(false), false), this.button('DIARY', onDiary, false));
    view.append(actions); if (!hasSave && !hasDiary) view.append(el('p','small-note','No diary yet. Start your first day.')); this.root.append(view);
  }
  public story(day: number, time: number, onMenu: () => void = () => undefined): { dialogue: HTMLElement; choices: HTMLElement } {
    clear(this.root); const view=el('section','view story-ui'); const hud=el('div','hud');
    hud.append(el('span',undefined,`DAY ${String(day).padStart(2,'0')}`),el('span',undefined,`${formatClock(time)} · ${daypart(time)}`));
    const dialogue=el('div','dialogue'); dialogue.setAttribute('aria-live','polite'); dialogue.addEventListener('click',this.onAdvance);
    const choices=el('div','choices'); const menu=this.button('MENU',onMenu,false); menu.classList.add('hud-action');
    view.append(hud,dialogue,choices,menu); this.root.append(view); return {dialogue,choices};
  }
  public renderNode(dialogue: HTMLElement, choices: HTMLElement, node: StoryNode, text: string, options: StoryOption[] = []): void {
    clear(dialogue); clear(choices); dialogue.className=`dialogue ${node.type}`;
    if (node.type==='choice') { dialogue.append(el('p','prompt',node.prompt ?? 'What do you do?')); for(const [i, option] of options.entries()){const button=this.button(`${String(i+1).padStart(2,'0')}  ${option.label}`,()=>this.onPick(option),false);button.classList.add('choice');choices.append(button);} return; }
    if (node.type==='dialogue') dialogue.append(el('div','speaker-tag',node.character==='tania'?'Tania':'Ainat'));
    const box=el('div','dialogue-box'); box.append(el('p','line',node.type==='system'?node.label:text),el('div','hint','tap or press space to continue')); dialogue.append(box);
  }
  public diaryWrite(state: {day:number;minutes:number;world:string}, context: string, onSave:(content:string)=>void, onBack:()=>void): void {
    clear(this.root); const labels=calendarLabels(state.day); const shell=el('section','view'); const book=el('div','diary-shell'); book.style.setProperty('--diary-frame','url("/assets/diary/book/diary_book_frame.png")'); const left=el('div','page page--lined'); left.append(el('div','month',labels.month),el('div','date',labels.full),el('p','context',context)); const right=el('div','page page--lined'); const area=document.createElement('textarea'); area.className='entry-text'; area.placeholder='Today...'; area.setAttribute('aria-label','Diary entry'); const actions=el('div','page-actions'); const save=this.button('SAVE ENTRY',()=>onSave(area.value),true); save.disabled=true; area.addEventListener('input',()=>{save.disabled=area.value.trim().length===0}); actions.append(this.button('BACK',onBack,false),save); right.append(el('div','date',`${formatClock(state.minutes)} · ${state.world}`),area,actions); book.append(left,right); shell.append(book); this.root.append(shell);
  }
  public history(entries: Array<{day:number;content:string}>, onOpen:(index:number)=>void, onBack:()=>void): void { clear(this.root); const view=el('section','view'); const box=el('div','history'); box.append(el('div','section-kicker','PRIVATE PAGES'),el('h2',undefined,'Diary')); if(!entries.length) box.append(el('p','small-note','No diary yet. Start your first day.')); entries.forEach((entry,index)=>{const firstLine=entry.content.split('\n')[0] ?? ''; const row=this.button(`${String(entry.day).padStart(2,'0')} — ${firstLine.slice(0,38)}`,()=>onOpen(index),false); row.classList.add('entry-row'); box.append(row)}); box.append(this.button('BACK',onBack,false)); view.append(box); this.root.append(view); }
  public read(entry:{day:number;content:string;time:string;locationLabel:string},onBack:()=>void):void{clear(this.root);const view=el('section','view');const book=el('div','diary-shell');const page=el('div','page');page.append(el('div','month',ordinalWord(entry.day)),el('div','date',`${entry.time} · ${entry.locationLabel}`),el('p','line',entry.content));page.append(this.button('BACK',onBack,false));book.append(page);view.append(book);this.root.append(view)}
  public endDay(day:number, summary:string, onClose:()=>void):void{clear(this.root);const view=el('section','view title');view.append(el('div','end-title',`DAY ${ordinalWord(day)}`),el('p','line','Today was...'),el('p','line',summary),el('p','small-note','— diarysetiaphary'),this.button('CLOSE DIARY',onClose,true));this.root.append(view)}
  public cg(asset: string, onContinue: () => void): void { clear(this.root); const view = el('section', 'view cg-view'); const frame = el('figure', 'cg-frame'); const image = document.createElement('img'); image.src = `/assets/cg/story/${asset}.png`; image.alt = 'A quiet daily-life moment'; image.loading = 'eager'; frame.append(image); view.append(frame, this.button('CONTINUE', onContinue, true)); this.root.append(view); }
  public menu(onResume:()=>void,onDiary:()=>void,onTitle:()=>void):void{clear(this.root);const view=el('section','view');const box=el('div','menu');box.append(el('div','section-kicker','PAUSE'),el('div','month','A quiet minute'),this.button('RESUME',onResume,true),this.button('DIARY',onDiary,false),this.button('TITLE',onTitle,false));view.append(box);this.root.append(view)}
  private button(label:string,action:()=>void,primary:boolean):HTMLButtonElement{const button=document.createElement('button');button.className=`button${primary?' primary':''}`;button.textContent=label;button.addEventListener('click',action);return button}
}
