import * as THREE from 'three';
import type { WorldId } from '../core/types';
import { prefersReducedMotion } from '../utils/dom';
import { paintWorld, type DayPeriod, type FallbackWorldTextures } from './paint';

type LayerRole = 'background' | 'far' | 'mid' | 'main' | 'character' | 'foreground' | 'fx';

const WORLD_ASSETS: Record<WorldId, Partial<Record<LayerRole, string>>> = {
  bedroom: {
    background: '/assets/environments/bedroom/bedroom_master.png',
  },
  garden: {
    background: '/assets/environments/garden/garden_master.png',
  },
  cafe: {
    background: '/assets/environments/cafe/cafe_master.png',
  },
};

export class ThreeWorld {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 20);
  private readonly cache = new Map<string, FallbackWorldTextures>();
  private readonly assetCache = new Map<string, THREE.Texture>();
  private readonly pendingAssets = new Map<string, Promise<THREE.Texture>>();
  private group: THREE.Group | null = null;
  private characterMesh: THREE.Mesh | null = null;
  private frame = 0;
  private elapsed = 0;
  private loadToken = 0;
  private reduced = prefersReducedMotion();
  private destroyed = false;
  private pointerX = 0;
  private pointerY = 0;
  private targetPointerX = 0;
  private targetPointerY = 0;
  private readonly handleResize = (): void => this.resize();
  private readonly handlePointer = (event: PointerEvent): void => {
    if (this.reduced || this.destroyed) return;
    const bounds = this.canvas.getBoundingClientRect();
    this.targetPointerX = THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
    this.targetPointerY = THREE.MathUtils.clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
  };
  private readonly handlePointerLeave = (): void => { this.targetPointerX = 0; this.targetPointerY = 0; };

  public constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    window.addEventListener('resize', this.handleResize);
    canvas.addEventListener('pointermove', this.handlePointer);
    canvas.addEventListener('pointerleave', this.handlePointerLeave);
    this.resize();
  }

  public load(world: WorldId, minutes: number): void {
    if (this.destroyed) return;
    const token = ++this.loadToken;
    this.clearGroup();
    const period = this.period(minutes);
    const key = `${world}:${period}`;
    const textures = this.cache.get(key) ?? paintWorld(world, period);
    this.cache.set(key, textures);
    const group = new THREE.Group();
    const layers: Array<[LayerRole, THREE.Texture, number]> = [
      ['background', textures.background, 0],
      ['far', textures.far, .1],
      ['mid', textures.mid, .2],
      ['main', textures.main, .35],
    ];
    for (const [role, texture, z] of layers) this.addPlane(group, texture, 0, 0, z, 10, 6.25, role);
    if (textures.character) this.characterMesh = this.addPlane(group, textures.character, world === 'garden' ? .2 : .18, -.2, .45, 2.1, 3.1, 'character');
    this.addPlane(group, textures.foreground, 0, 0, .6, 10, 6.25, 'foreground');
    this.group = group;
    this.scene.add(group);
    for (const [role, url] of Object.entries(WORLD_ASSETS[world])) {
      void this.loadTexture(url).then((texture) => {
        if (this.destroyed || token !== this.loadToken || !this.group) return;
        const mesh = this.group.children.find((child) => child.userData.role === role) as THREE.Mesh | undefined;
        if (!mesh || !(mesh.material instanceof THREE.MeshBasicMaterial)) return;
        mesh.material.map = texture;
        mesh.material.needsUpdate = true;
      }).catch(() => undefined);
    }
    this.render();
  }

  public start(): void {
    if (this.reduced || this.frame) return;
    const tick = (now: number) => {
      this.elapsed = now / 1000;
      if (this.group) {
        if (this.characterMesh) this.characterMesh.position.y = -.2 + Math.sin(this.elapsed * .8) * .025;
      }
      this.render();
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  public stop(): void { cancelAnimationFrame(this.frame); this.frame = 0; }

  public destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    ++this.loadToken;
    this.stop(); this.clearGroup();
    const disposed = new Set<THREE.Texture>();
    for (const textures of this.cache.values()) Object.values(textures).forEach((item) => {
      if (item && !disposed.has(item)) { disposed.add(item); item.dispose(); }
    });
    for (const texture of this.assetCache.values()) texture.dispose();
    window.removeEventListener('resize', this.handleResize);
    this.canvas.removeEventListener('pointermove', this.handlePointer);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
    this.cache.clear(); this.pendingAssets.clear(); this.renderer.dispose();
  }

  private addPlane(group: THREE.Group, map: THREE.Texture, x: number, y: number, z: number, width: number, height: number, role: LayerRole): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map, transparent: true }));
    mesh.position.set(x, y, z); mesh.scale.set(width, height, 1); mesh.userData.role = role; group.add(mesh); return mesh;
  }

  private clearGroup(): void {
    if (!this.group) return;
    this.group.traverse((item) => { if (item instanceof THREE.Mesh) { item.geometry.dispose(); item.material.dispose(); } });
    this.scene.remove(this.group); this.group = null; this.characterMesh = null;
  }

  private loadTexture(url: string): Promise<THREE.Texture> {
    const cached = this.assetCache.get(url);
    if (cached) return Promise.resolve(cached);
    const pending = this.pendingAssets.get(url);
    if (pending) return pending;
    const request = new Promise<THREE.Texture>((resolve, reject) => {
      new THREE.TextureLoader().load(url, (texture) => {
        if (this.destroyed) { texture.dispose(); reject(new Error('ThreeWorld was destroyed')); return; }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        this.assetCache.set(url, texture);
        this.pendingAssets.delete(url);
        resolve(texture);
      }, undefined, (error) => { this.pendingAssets.delete(url); console.warn(`[diarysetiaphary] asset load failed: ${url}`); reject(error); });
    });
    this.pendingAssets.set(url, request);
    return request;
  }

  private resize(): void {
    if (this.destroyed) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    const halfHeight = 3;
    const halfWidth = halfHeight * aspect;
    this.camera.left = -halfWidth; this.camera.right = halfWidth; this.camera.top = halfHeight; this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix(); this.render();
  }

  private period(minutes: number): DayPeriod {
    if (minutes < 12 * 60) return 'morning';
    if (minutes < 17 * 60) return 'afternoon';
    if (minutes < 20 * 60) return 'evening';
    return 'night';
  }

  private render(): void {
    if (this.destroyed) return;
    if (!this.reduced) {
      this.pointerX += (this.targetPointerX - this.pointerX) * .08;
      this.pointerY += (this.targetPointerY - this.pointerY) * .08;
      this.camera.position.x = this.pointerX * .12;
      this.camera.position.y = -this.pointerY * .08;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.render(this.scene, this.camera);
  }
}
