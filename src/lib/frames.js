/* ══════════════════════════════════════════════════════════════════
   frames.js — canvas frame-sequence scrubber (framework-agnostic).

   Playback half of the ASSET PIPELINE. Every animated coffee moment is a
   folder of numbered WebP frames extracted by ffmpeg from a real motion
   clip (see pipeline/build_assets.py SEQUENCE MAP). Nothing here tweens a
   DOM node or morphs a vector — the only thing that changes is WHICH
   photographic frame is painted.
   ══════════════════════════════════════════════════════════════════ */

let MANIFEST = { sequences: {}, stills: {} };

/* The whole page hangs off this one small JSON file, so a single flaky
   request must not decide the visit. fetch() does not reject on a 404 — it
   used to sail through and die later inside res.json() — so the status is
   checked, and one transient failure is retried before giving up. If it
   still fails this throws, and App boots the page anyway (see App.jsx). */
export async function loadManifest(base = import.meta.env.BASE_URL, tries = 2) {
  if (Object.keys(MANIFEST.sequences).length) return MANIFEST;
  let last;
  for (let i = 0; i < tries; i++) {
    if (i) await new Promise((r) => setTimeout(r, 400));
    try {
      const res = await fetch(`${base}assets/manifest.json`);
      if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
      MANIFEST = await res.json();
      return MANIFEST;
    } catch (e) { last = e; }
  }
  throw last;
}

export const manifest = () => MANIFEST;
/* Cache-buster: stills and frames keep stable filenames, so without this a
   browser keeps showing yesterday's cups after the photography is replaced. */
export const assetV = () => (MANIFEST.build ? `?v=${MANIFEST.build}` : '');
export const hasSeq = (name) => !!MANIFEST.sequences[name];

export class FrameSequence {
  constructor(name, canvas = null, base = import.meta.env.BASE_URL) {
    this.name = name;
    this.base = base;
    this.entry = MANIFEST.sequences[name];
    this.count = this.entry ? this.entry.count : 0;
    this.images = [];
    this.current = -1;
    this._p = null;
    this.setCanvas(canvas);
  }

  /* The manifest is fetched async, so a sequence may be constructed before it
     lands. Resolve the entry lazily instead of capturing it once at build
     time -- otherwise the sequence silently reports 0 frames forever. */
  _resolve() {
    if (!this.entry) {
      this.entry = MANIFEST.sequences[this.name];
      if (this.entry) this.count = this.entry.count;
    }
    return this.entry;
  }

  setCanvas(canvas) {
    this.canvas = canvas || null;
    this.ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
    this.current = -1;
  }

  url(i) {
    const e = this.entry;
    const v = MANIFEST.build ? `?v=${MANIFEST.build}` : '';
    return `${this.base}${e.dir}/${e.base}-${String(i + 1).padStart(e.pad, '0')}.${e.ext}${v}`;
  }

  load(onProgress) {
    this._resolve();
    if (this._p && this.count) return this._p;
    this._p = null;
    if (!this.entry) {
      console.warn(`[frames] "${this.name}" missing from manifest`);
      return (this._p = Promise.resolve(this));
    }
    this._p = new Promise((resolve) => {
      let done = 0;
      const tick = () => {
        done++;
        onProgress?.(done / this.count);
        if (done === this.count) resolve(this);
      };
      for (let i = 0; i < this.count; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.onload = tick;
        img.onerror = tick;          // one bad frame must never stall the loader
        img.src = this.url(i);
        this.images[i] = img;
      }
    });
    return this._p;
  }

  /** Match backing store to the CSS box x DPR (capped at 2).
      Uses offsetWidth/Height, NOT getBoundingClientRect: the rect includes
      any CSS transform, so a cup parked at scale(0.19) would get a 69x96
      backing store and stay pixelated once it scaled back up. */
  size() {
    const c = this.canvas;
    if (!c) return;
    const w0 = c.offsetWidth;
    const h0 = c.offsetHeight;
    if (!w0 || !h0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(w0 * dpr);
    const h = Math.round(h0 * dpr);
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
      if (this.current >= 0) this.draw(this.current, true);
    }
  }

  draw(i, force) {
    if (!this.count) this._resolve();
    if (!this.ctx || !this.count) return;
    i = Math.max(0, Math.min(this.count - 1, i | 0));
    if (i === this.current && !force) return;
    const img = this.images[i];
    if (!img?.complete || !img.naturalWidth) return;
    this.current = i;
    const c = this.canvas;
    const ctx = this.ctx;
    if (!c.width || !c.height) this.size();
    ctx.clearRect(0, 0, c.width, c.height);
    const s = Math.min(c.width / img.naturalWidth, c.height / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  }

  /** progress 0..1 -> frame index. The core of the scroll-scrub. */
  setProgress(p) {
    if (!this.count) this._resolve();
    if (!this.count) return;
    this.draw(Math.round(Math.max(0, Math.min(1, p)) * (this.count - 1)));
  }
}

/* Shared registry so a sequence is only ever downloaded once. */
const cache = new Map();
export function getSequence(name, canvas) {
  if (!cache.has(name)) cache.set(name, new FrameSequence(name, canvas));
  const s = cache.get(name);
  if (canvas && s.canvas !== canvas) s.setCanvas(canvas);
  return s;
}
export const warmSequence = (name) =>
  hasSeq(name) ? getSequence(name).load() : Promise.resolve();
