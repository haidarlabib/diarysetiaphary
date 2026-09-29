/** Day 01 — Bedroom, morning. Story content lives here, never in renderers. */
import type { StoryScene } from '../../core/types';

export const bedroomMorning: StoryScene = {
  id: 'bedroom_morning',
  world: 'bedroom',
  entry: 'sys',
  onEnter: { time: '07:20' },
  nodes: [
    { id: 'sys', type: 'system', label: 'Morning — 07:20' },
    {
      id: 'n1',
      type: 'narration',
      text: 'Hari ini terasa seperti hari biasa.',
      variants: [
        {
          when: (s) => s.day >= 2,
          text: 'Hari baru. Cahayanya sama, cuma aku yang sedikit berbeda.',
        },
      ],
    },
    {
      id: 't1',
      type: 'thought',
      text: 'Aku belum tahu hari ini akan berisi apa.',
      variants: [{ when: (s) => s.diary.length > 0, text: 'Semalam sudah kutulis. Hari ini gilirannya.' }],
    },
    {
      id: 'open',
      type: 'choice',
      prompt: 'Apa yang ingin kamu lakukan?',
      options: [
        { label: 'Write in Diary', action: 'openDiary', diaryContext: 'Pagi di kamar. Belum terjadi apa pun — dan itu sendiri sudah layak dicatat.' },
        { label: 'Visit Tania', action: 'goTo:garden' },
        { label: 'Visit Ainat', action: 'goTo:cafe' },
      ],
    },
  ],
};

