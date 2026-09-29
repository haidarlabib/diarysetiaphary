/** Day 01 — Cafe / Ainat. */
import type { StoryScene } from '../../core/types';

export const cafe: StoryScene = {
  id: 'cafe',
  world: 'cafe',
  entry: 'arrive',
  onEnter: { time: '18:05', meet: 'ainat' },
  nodes: [
    { id: 'arrive', type: 'narration', text: 'Kafe. Ainat sedang mengelap cangkir di balik meja.' },
    { id: 'a1', type: 'dialogue', character: 'ainat', text: 'Kamu kelihatan seperti orang yang habis mikir keras.' },
    { id: 'n1', type: 'narration', text: 'Di sudut, seorang pria menulis di buku kecilnya.' },
    {
      id: 'choice_01',
      type: 'choice',
      prompt: 'What do you do?',
      options: [
        { label: 'Order something', next: 'order' },
        { label: 'Ask about the man', next: 'askman' },
        { label: 'Write this moment in Diary', action: 'openDiary', diaryContext: 'Ainat punya cara membuat sore terasa lebih pelan.' },
        { label: 'Visit Tania', action: 'goTo:garden' },
      ],
    },
    // --- branch A ---
    { id: 'order', type: 'dialogue', character: 'ainat', text: 'Seperti biasa? Hangatnya sama, ya.' },
    { id: 'order_2', type: 'thought', text: 'Dia ingat pesananku.' },
    { id: 'order_join', type: 'narration', text: 'Uap naik pelan dari cangkir.', next: 'shared' },
    // --- branch B ---
    { id: 'askman', type: 'dialogue', character: 'ainat', text: 'Oh, dia? Dia datang tiap Selasa. Nulis terus.' },
    { id: 'askman_2', type: 'dialogue', character: 'ainat', text: 'Katanya dia lagi nulis diary juga. Kayak kamu.' },
    { id: 'askman_join', type: 'thought', text: 'Rupanya bukan cuma aku.' },
    { id: 'askman_join2', type: 'narration', text: 'Ainat tertawa pelan.', next: 'shared' },
    // --- shared ---
    { id: 'shared', type: 'dialogue', character: 'ainat', text: 'Kamu sendiri, gimana hari ini?' },
    { id: 'shared_2', type: 'narration', text: 'Lampu kafe mulai kuning saat sore turun.' },
    {
      id: 'after',
      type: 'choice',
      options: [
        { label: 'Write this moment in Diary', action: 'openDiary', diaryContext: 'Sore di kafe bersama Ainat.' },
        { label: 'Visit Tania', action: 'goTo:garden' },
        { label: 'Go back home', action: 'goTo:bedroom_evening' },
      ],
    },
  ],
};

