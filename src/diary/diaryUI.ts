import { addDiaryEntry, getState, setPhase } from '../core/state';
import { charactersAtWorld, locationLabelFor } from '../characters/characters';
import { makeId } from '../utils/dom';
import { formatClock, isoDateForDay } from '../utils/time';
import type { Views } from '../ui/views';

export class DiaryUI {
  public constructor(private readonly views: Views) {}
  public write(context: string, onBack: () => void): void { setPhase('diary'); const state=getState(); this.views.diaryWrite(state,context,(content)=>{const current=getState();addDiaryEntry({id:makeId(),date:isoDateForDay(current.day),time:formatClock(current.minutes),day:current.day,location:current.world,locationLabel:locationLabelFor(current.world),characters:charactersAtWorld(current.world),context,content:content.trim()});onBack()},onBack); }
  public history(onBack:()=>void):void{setPhase('diary');this.views.history(getState().diary.map((entry)=>({day:entry.day,content:entry.content})),(index)=>{const entry=getState().diary[index];if(entry)this.views.read(entry,onBack)},onBack)}
  public end(summary:string,onClose:()=>void):void{setPhase('endOfDay');this.views.endDay(getState().day,summary,onClose)}
}
