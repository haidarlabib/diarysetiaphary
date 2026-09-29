/** Day 01 — Garden / Tania. Small branching with shared convergence (PRD §42, §45). */
import type { StoryScene } from '../../core/types';

const toHub: StoryScene['nodes'][number] = {
  id: 'after',
  type: 'choice',
  prompt: 'Apa yang ingin kamu lakukan?',
  options: [
    { label: 'Write this moment in Diary', action: 'openDiary', diaryContext: 'Sore itu di taman bersama Tania.' },
    { label: 'Visit Ainat', action: 'goTo:cafe' },
    { label: 'Go back home', action: 'goTo:bedroom_evening' },
  ],
};

export const garden: StoryScene = {
  id: 'garden',
  world: 'garden',
  entry: 'arrive',
  onEnter: { time: '16:42', meet: 'tania' },
  nodes: [
    { id: 'arrive', type: 'narration', text: 'Taman. Tania berdiri dekat bangku batu.' },
    { id: 't1', type: 'dialogue', character: 'tania', text: 'Kamu akhirnya datang.' },
    { id: 'n1', type: 'narration', text: 'Udara sore terasa sedikit lebih dingin.' },
    { id: 't2', type: 'dialogue', character: 'tania', text: 'Aku tadi kepikiran sesuatu.' },
    {
      id: 'choice_01',
      type: 'choice',
      prompt: 'What do you do?',
      options: [
        { label: 'Listen', next: 'listen' },
        { label: 'Ask her', next: 'ask' },
        { label: 'See this moment', action: 'showCg:cg_daily_life_01', next: 'shared' },
        { label: 'Write this moment in Diary', action: 'openDiary', diaryContext: 'Tania bilang dia kepikiran sesuatu. Aku ingin mengingatnya.' },
        { label: 'Visit Ainat', action: 'goTo:cafe' },
      ],
    },
    // --- branch A: listen ---
    { id: 'listen', type: 'dialogue', character: 'tania', text: 'Kayaknya hari ini bakal hujan.' },
    { id: 'listen_2', type: 'dialogue', character: 'tania', text: 'Aku sebenarnya suka suara hujan.' },
    { id: 'listen_3', type: 'thought', text: 'Dia tidak menatapku saat mengatakannya.' },
    { id: 'listen_join', type: 'narration', text: 'Kami diam sebentar.', next: 'shared' },
    // --- branch B: ask ---
    { id: 'ask', type: 'dialogue', character: 'tania', text: 'Kamu mau tahu?' },
    { id: 'ask_2', type: 'dialogue', character: 'tania', text: 'Kadang aku merasa kamu lebih jujur di diary daripada di obrolan.' },
    { id: 'ask_3', type: 'thought', text: 'Mungkin dia benar.' },
    { id: 'ask_join', type: 'narration', text: 'Kami sama-sama tersenyum sedikit.', next: 'shared' },
    // --- shared convergence ---
    { id: 'shared', type: 'dialogue', character: 'tania', text: 'Kamu sendiri?' },
    { id: 'shared_2', type: 'narration', text: 'Angin lewat, daun-daun bergeser pelan.' },
    toHub,
  ],
};

