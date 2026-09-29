import * as THREE from 'three';
import type { WorldId } from '../core/types';
import { CHARACTERS } from '../characters/characters';

const SIZE = 1024;

function canvas(): HTMLCanvasElement {
  const value = document.createElement('canvas');
  value.width = SIZE;
  value.height = 640;
  return value;
}

function texture(draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const value = canvas();
  const ctx = value.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  draw(ctx);
  const result = new THREE.CanvasTexture(value);
  result.colorSpace = THREE.SRGBColorSpace;
  result.needsUpdate = true;
  return result;
}

function fill(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, SIZE, 640);
}

function line(ctx: CanvasRenderingContext2D, color: string, width: number, points: [number, number][]): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  points.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.stroke();
}

function grain(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(48, 48, 42, .035)';
  for (let index = 0; index < 500; index += 1) {
    ctx.fillRect((index * 73) % SIZE, (index * 127) % 640, 1, 1);
  }
}

export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

function background(world: WorldId, period: DayPeriod): THREE.CanvasTexture {
  const evening = period === 'evening' || period === 'night';
  const night = period === 'night';
  return texture((ctx) => {
    if (world === 'bedroom') fill(ctx, night ? '#555A68' : evening ? '#9A877A' : period === 'morning' ? '#DCD3C2' : '#D2C5B3');
    if (world === 'garden') fill(ctx, night ? '#68716B' : evening ? '#A08C78' : period === 'morning' ? '#D9DDD1' : '#D3D8CB');
    if (world === 'cafe') fill(ctx, night ? '#57545A' : evening ? '#9A8171' : period === 'morning' ? '#D8CDBD' : '#D1C4B3');
    const sky = ctx.createLinearGradient(0, 0, 0, 640);
    sky.addColorStop(0, night ? 'rgba(38,45,65,.44)' : evening ? 'rgba(70,77,91,.32)' : 'rgba(247,239,222,.44)');
    sky.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, SIZE, 640);
    grain(ctx);
  });
}

function environment(world: WorldId, period: DayPeriod): THREE.CanvasTexture {
  const evening = period === 'evening' || period === 'night';
  const night = period === 'night';
  return texture((ctx) => {
    ctx.strokeStyle = 'rgba(47,52,48,.48)';
    ctx.fillStyle = night ? 'rgba(45,50,55,.82)' : evening ? 'rgba(57,61,60,.78)' : 'rgba(104,112,92,.78)';
    if (world === 'garden') {
      ctx.beginPath();
      ctx.arc(210, 170, 125, Math.PI, Math.PI * 2);
      ctx.arc(350, 180, 150, Math.PI, Math.PI * 2);
      ctx.fill();
      line(ctx, '#6B5D4F', 12, [[110, 410], [130, 220]]);
      line(ctx, '#6B5D4F', 10, [[130, 290], [70, 235]]);
      ctx.fillStyle = evening ? '#756B5B' : '#907862';
      ctx.fillRect(520, 410, 270, 24);
      ctx.fillRect(540, 450, 12, 95);
      ctx.fillRect(760, 450, 12, 95);
      line(ctx, '#6B5D4F', 4, [[520, 448], [790, 448]]);
      ctx.fillStyle = 'rgba(232,220,191,.7)';
      ctx.beginPath(); ctx.ellipse(650, 585, 180, 35, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (world === 'bedroom') {
      ctx.fillStyle = evening ? '#3F4C59' : '#C3D2D2';
      ctx.fillRect(620, 65, 245, 270);
      ctx.strokeStyle = '#8B8373'; ctx.lineWidth = 12; ctx.strokeRect(620, 65, 245, 270);
      ctx.fillStyle = evening ? '#A47F69' : '#B9A990';
      ctx.fillRect(90, 420, 360, 22); ctx.fillRect(120, 442, 18, 120); ctx.fillRect(405, 442, 18, 120);
      ctx.fillStyle = '#B4A28B'; ctx.fillRect(740, 440, 150, 120);
      ctx.fillStyle = '#82937C'; ctx.beginPath(); ctx.arc(820, 400, 42, 0, Math.PI * 2); ctx.fill();
    }
    if (world === 'cafe') {
      ctx.fillStyle = evening ? '#32383F' : '#B6C3C3'; ctx.fillRect(120, 80, 340, 220);
      ctx.strokeStyle = '#7E8177'; ctx.lineWidth = 10; ctx.strokeRect(120, 80, 340, 220);
      ctx.fillStyle = evening ? '#6E584A' : '#866B56'; ctx.fillRect(0, 405, SIZE, 90);
      ctx.fillStyle = '#A18B75'; ctx.fillRect(620, 380, 210, 20); ctx.fillRect(700, 400, 16, 150);
      ctx.fillStyle = '#EFE5D0'; ctx.beginPath(); ctx.arc(725, 365, 35, 0, Math.PI * 2); ctx.fill();
    }
  });
}

function foreground(world: WorldId): THREE.CanvasTexture {
  return texture((ctx) => {
    ctx.fillStyle = 'rgba(54,63,53,.48)';
    if (world === 'garden') {
      ctx.beginPath(); ctx.arc(45, 635, 190, Math.PI, Math.PI * 1.5); ctx.fill();
      ctx.beginPath(); ctx.arc(1010, 635, 210, Math.PI * 1.5, Math.PI * 2); ctx.fill();
    }
    if (world === 'bedroom') ctx.fillRect(0, 0, 34, 640);
    if (world === 'cafe') { ctx.beginPath(); ctx.arc(900, 640, 160, Math.PI, Math.PI * 2); ctx.fill(); }
  });
}

function figure(id: 'tania' | 'ainat'): THREE.CanvasTexture {
  const palette = CHARACTERS[id].palette;
  return texture((ctx) => {
    ctx.clearRect(0, 0, SIZE, 640);
    ctx.fillStyle = 'rgba(237,226,204,.55)'; ctx.beginPath(); ctx.arc(512, 160, 125, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = palette.dress; ctx.beginPath(); ctx.moveTo(385, 600); ctx.lineTo(430, 280); ctx.lineTo(594, 280); ctx.lineTo(650, 600); ctx.closePath(); ctx.fill();
    ctx.fillStyle = palette.skin; ctx.beginPath(); ctx.arc(512, 180, 67, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = palette.hair; ctx.beginPath(); ctx.arc(512, 155, 74, Math.PI, Math.PI * 2); ctx.fill();
    if (id === 'tania') { ctx.beginPath(); ctx.arc(575, 106, 28, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = 'rgba(47,52,48,.62)'; ctx.lineWidth = 6; ctx.strokeRect(385, 280, 265, 320);
    ctx.fillStyle = palette.accent; ctx.fillRect(430, 300, 22, 170);
  });
}

export interface WorldTextures { background: THREE.CanvasTexture; environment: THREE.CanvasTexture; foreground: THREE.CanvasTexture; character?: THREE.CanvasTexture; }

export interface FallbackWorldTextures {
  background: THREE.CanvasTexture;
  far: THREE.CanvasTexture;
  mid: THREE.CanvasTexture;
  main: THREE.CanvasTexture;
  foreground: THREE.CanvasTexture;
  character?: THREE.CanvasTexture;
  fx?: THREE.CanvasTexture;
}

export function paintWorld(world: WorldId, period: DayPeriod): FallbackWorldTextures {
  const backgroundTexture = background(world, period);
  const environmentTexture = environment(world, period);
  return {
    background: backgroundTexture,
    far: backgroundTexture,
    mid: environmentTexture,
    main: environmentTexture,
    foreground: foreground(world),
    character: world === 'garden' ? figure('tania') : world === 'cafe' ? figure('ainat') : undefined,
  };
}
