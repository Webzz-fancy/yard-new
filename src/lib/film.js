/* ══════════════════════════════════════════════════════════════════════
   film.js — which cut of the padel opening this viewport should play.

   The clip is 16:9 (1280x720). Cover-fitting it to a portrait phone shows
   only the middle ~26% of the frame — the player, the ball and the whole
   cups-and-racket arrangement fall outside the visible band — and then
   upscales that sliver ~2.3x. That is why the opening read as a blurry
   patch of empty court on a phone.

   tools/make-portrait-film.py bakes a portrait cut ("padel-tall") that pans
   with the subject and is already at phone resolution, so the browser draws
   it about 1:1. It is also SMALLER than the wide sequence (6.7 MB vs 8.1),
   so a phone downloads less and sees more.

   Everything the hand-off needs is measured in SOURCE pixels and mapped
   through one transform, so there is only ever one set of cup coordinates
   to keep honest.
   ══════════════════════════════════════════════════════════════════ */

import { hasSeq } from './frames';

/* the tall cut is a 332px-wide band of the same 1280x720 frame, blown up to
   800x1735 — the tail of the film is locked dead-centre by the exporter, so
   the cup box maps straight through that crop-and-scale */
const BAND = 332;
const LEFT = (1280 - BAND) / 2;
const S = 800 / BAND;

const CUP = { x: 476, y: 163, w: 322, h: 413 };   // cup box inside the last frame

export const WIDE = {
  seq: 'padel', FW: 1280, FH: 720,
  plate: 'padel-plate.webp', poster: 'poster-padel.webp',
  cup: CUP
};

export const TALL = {
  seq: 'padel-tall', FW: 800, FH: 1735,
  plate: 'padel-plate-tall.webp', poster: 'poster-padel-tall.webp',
  cup: { x: (CUP.x - LEFT) * S, y: CUP.y * S, w: CUP.w * S, h: CUP.h * S }
};

/* Chosen from the live viewport, not the device: a phone turned sideways
   wants the wide cut back, and HeroStory re-picks on resize. */
export const heroFilm = () =>
  (hasSeq('padel-tall') &&
   window.matchMedia('(orientation: portrait) and (max-width: 820px)').matches)
    ? TALL : WIDE;
