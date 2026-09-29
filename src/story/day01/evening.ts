/** Day 01 â€” evening at home: the pre-sleep hub, then short night revisits. */
import type { StoryScene } from '../../core/types';

export const bedroomEvening: StoryScene = {
  id: 'bedroom_evening',
  world: 'bedroom',
  entry: 'sys',
  onEnter: { time: '20:40' },
  nodes: [
    { id: 'sys', type: 'system', label: 'Evening â€” 20:40' },
    {
      id: 'arrive',
      type: 'narration',
      text: 'Lampu kamar menyala. Hari hampir selesai.',
    },
    {
      id: 't1',
      type: 'thought',
      text: 'Ada hal-hal yang baru terasa berarti setelah gelap.',
    },
    {
      id: 'hub',
      type: 'choice',
      prompt: 'Sebelum menutup hari ini:',
      options: [
        { label: 'Write in Diary', action: 'openDiary', diaryContext: 'Malam di kamar. Lampu kuning, halaman kosong.' },
        {
          label: 'Visit Tania again',
          action: 'goTo:garden_evening',
          when: (s) => s.relationships.tania !== 'unknown',
        },
        {
          label: 'Visit Ainat again',
          action: 'goTo:cafe_evening',
          when: (s) => s.relationships.ainat !== 'unknown',
        },
        { label: 'End the day', action: 'endDay' },
      ],
    },
  ],
};

export const gardenEvening: StoryScene = {
  id: 'garden_evening',
  world: 'garden',
  entry: 'arrive',
  nodes: [
    {
      id: 'arrive',
      type: 'narration',
      text: 'Malam. Taman tinggal lampu jalan dan dua sosok.',
    },
    { id: 't1', type: 'dialogue', character: 'tania', text: 'Ku kira kamu sudah tidur.' },
    {
      id: 't2',
      type: 'dialogue',
      character: 'tania',
      text: 'Beberapa hal lebih gampang diucapkan malam hari.',
      variants: [{ when: (s) => s.relationships.tania === 'familiar', text: 'Kamu lagi. Bagus.' }],
    },
    {
      id: 'after',
      type: 'choice',
      options: [
        { label: 'Write this moment in Diary', action: 'openDiary', diaryContext: 'Malam, taman, dan suara yang lebih pelan dari biasanya.' },
        { label: 'Go home', action: 'goTo:bedroom_late' },
      ],
    },
  ],
};

export const cafeEvening: StoryScene = {
  id: 'cafe_evening',
  world: 'cafe',
  entry: 'arrive',
  nodes: [
    { id: 'arrive', type: 'narration', text: 'Kafe tinggal satu meja yang tersisa.' },
    { id: 'a1', type: 'dialogue', character: 'ainat', text: 'Pesanan terakhir selalu yang paling tenang.' },
    {
      id: 'after',
      type: 'choice',
      options: [
        { label: 'Write this moment in Diary', action: 'openDiary', diaryContext: 'Ainat menutup kafe sambil bersenandung kecil.' },
        { label: 'Go home', action: 'goTo:bedroom_late' },
      ],
    },
  ],
};

export const bedroomLate: StoryScene = {
  id: 'bedroom_late',
  world: 'bedroom',
  entry: 'arrive',
  onEnter: { time: '22:30' },
  nodes: [
    { id: 'arrive', type: 'narration', text: 'Buku ini tinggal satu halaman lagi malam ini.' },
    {
      id: 'final',
      type: 'choice',
      options: [
        { label: 'Write in Diary', action: 'openDiary', diaryContext: 'Menjelang tidur.' },
        { label: 'End the day', action: 'endDay' },
      ],
    },
  ],
};

