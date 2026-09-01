import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { FLAVORS, HERO_ROW, STORY_ORDER, ALL_DRINKS, STATS, storeLink } from '../data/flavors';
import { openStoreSheet } from './StoreModal';
import { assetV, getSequence } from '../lib/frames';
import { heroFilm } from '../lib/film';
import { useFlavor } from '../hooks/useFlavor';
import { useLang } from '../hooks/useLang';

/* ══════════════════════════════════════════════════════════════════════
   HeroStory — the hero and the old "Section 2" are ONE pinned section.

     HALF 1  the cup row, headline, stats
     TRAVEL  the lead (brown) cup descends into the centre of half 2
     HALF 2  the flavour story: cups hand off left-to-right, callouts wipe

   THE CUPS ARE STILL IMAGES. There is no frame scrub in half 2 any more —
   the liquid does not move (explicit request). Everything the cups do is a
   transform, which means the whole section reverses exactly: scrubbed
   tweens play backwards frame-for-frame, and the two pieces of state that
   are NOT tweens (the palette and the 01/02/03 counter) are recomputed
   from the timeline playhead on every update instead of being fired by
   one-shot callbacks. One-shot callbacks are what used to leave the wrong
   colour behind when you scrolled back up.
   ══════════════════════════════════════════════════════════════════ */

export default function HeroStory() {
  const rootRef = useRef(null);
  const pinRef = useRef(null);
  const leadRef = useRef(null);      // .hcup__inner of the lead cup — travels
  const leadBoxRef = useRef(null);   // .hcup--lead — exits left at the hand-off
  const leadImgRef = useRef(null);
  const slotRef = useRef(null);      // invisible marker: a cup's box in half 2
  const queueRefs = [useRef(null), useRef(null), useRef(null)];   // v60, acai, sharjah cloud
  const videoRef = useRef(null);     // full-bleed canvas: the padel film
  const audioRef = useRef(null);     // the film's own soundtrack, played as an ambient bed
  const soundRef = useRef(null);     // the Sound toggle — off until asked for
  const heroLayer = useRef(null);
  const storyLayer = useRef(null);
  const idxRef = useRef(null);
  const { setFlavor, activeRef } = useFlavor();
  const { t } = useLang();

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    const cup = leadRef.current;
    if (!root || !pin || !cup) return;

    const touch = window.matchMedia('(hover: none)').matches;
    const narrow = window.matchMedia('(max-width: 900px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const bigLines = gsap.utils.toArray('.story__big .sl > span');
      const panels = gsap.utils.toArray('.story__panel');

      /* ── entrance state ── */
      gsap.set(bigLines, { yPercent: 112 });
      gsap.set(cup, { opacity: 0 });          // hidden until the film hands it over
      gsap.set(panels, { autoAlpha: 0 });
      gsap.set(storyLayer.current, { opacity: 0 });

      /* ── the film ──
         240 frames of the padel opening, cover-fitted and scrubbed by the
         first stretch of the pin. The last frame is the raspberry cup alone
         on cream; at that point the canvas switches to a cup-free plate and
         the real lead cup (the same cup, cut out) takes over and travels. */
      const vcan = videoRef.current;
      /* WHICH CUT — wide on a landscape screen, the portrait re-frame on a
         phone held upright. See lib/film.js; the choice is re-made on resize
         so rotating the phone swaps the cut rather than mangling the crop. */
      let view = heroFilm();
      let film = getSequence(view.seq, vcan);
      const plate = new Image();
      const poster = new Image();                     // stands in for any frame that has not arrived yet
      poster.onload = () => { if (filmFrame < 0 && !onPlate) drawCover(poster); };
      plate.onload = () => { if (onPlate) drawCover(plate); };

      const cover = () => {
        const vw = pin.offsetWidth, vh = pin.offsetHeight;
        const sc = Math.max(vw / view.FW, vh / view.FH);
        return { sc, dx: (vw - view.FW * sc) / 2, dy: (vh - view.FH * sc) / 2 };
      };
      const drawCover = (img) => {
        const c = vcan, g = c.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(c.offsetWidth * dpr), h = Math.round(c.offsetHeight * dpr);
        if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
        if (!img?.complete || !img.naturalWidth) return false;
        const { sc, dx, dy } = cover();
        g.clearRect(0, 0, w, h);
        g.drawImage(img, dx * dpr, dy * dpr, view.FW * sc * dpr, view.FH * sc * dpr);
        return true;
      };
      let filmFrame = -1, onPlate = false;
      const paintFilm = (p) => {
        film._resolve?.();
        const i = Math.round(Math.max(0, Math.min(1, p)) * (film.count - 1));
        if (p >= 1) { if (!onPlate) { onPlate = drawCover(plate); filmFrame = -1; } return; }
        onPlate = false;
        if (i === filmFrame) return;
        if (drawCover(film.images[i])) filmFrame = i;   // only cache once it really painted
        else if (filmFrame < 0) drawCover(poster);      // nothing painted yet → poster, never blank
      };
      const repaint = () => { const f = filmFrame; filmFrame = -1; if (onPlate) { onPlate = false; paintFilm(1); } else paintFilm(Math.max(0, f) / (film.count - 1)); };
      /* place the lead cup exactly over the cup in the last frame */
      const placeLead = () => {
        const { sc, dx, dy } = cover();
        const cup = view.cup;
        const box = leadBoxRef.current;
        gsap.set(box, { left: dx + cup.x * sc, top: dy + cup.y * sc, width: cup.w * sc, right: 'auto' });
      };

      /* (re)point the canvas at the current cut and pull it down */
      const loadView = () => {
        film = getSequence(view.seq, vcan);
        plate.src = `${import.meta.env.BASE_URL}assets/stills/${view.plate}${assetV()}`;
        poster.src = `${import.meta.env.BASE_URL}assets/stills/${view.poster}${assetV()}`;
        filmFrame = -1; onPlate = false;
        film.load().then(repaint);
      };
      placeLead();
      loadView();

      /* ── the opening fade ──
         This used to be fired by App once the page was released. On a phone
         the release happens BEFORE this component has mounted, so App called
         window.__heroIntro?.() into thin air, the optional-call swallowed it,
         and the canvas sat at opacity 0 for the whole visit — the film never
         appeared and you got the bare cream page. The intro now belongs to
         the component: it is idempotent, and if the release already happened
         it runs immediately instead of waiting to be called. */
      let introDone = false;
      const intro = () => {
        if (introDone) return;
        introDone = true;
        paintFilm(0);                                  // never fade up a blank canvas
        gsap.fromTo(vcan, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' });
      };
      window.__heroIntro = intro;
      if (reduced) { gsap.set(vcan, { opacity: 1 }); introDone = true; }
      else if (window.__pageReleased) intro();

      /* ── measure where the lead cup must land in half 2 ──
         Measured from OFFSETS, never getBoundingClientRect(): the rect
         includes every transform above the element, and at refresh time the
         cup still carries its entrance transform. Offsets cannot drift. */
      const target = { x: 0, y: 0, scale: 1 };
      const preview = { x: 0, y: 0, scale: 0.3 };

      const offsetIn = (el, stop) => {
        let ox = 0, oy = 0, n = el;
        while (n && n !== stop && n.offsetParent) {
          ox += n.offsetLeft; oy += n.offsetTop; n = n.offsetParent;
        }
        return { x: ox, y: oy };
      };

      const measure = () => {
        placeLead();
        repaint();
        const slotEl = slotRef.current;
        if (!slotEl) return;
        const cupW = cup.offsetWidth, cupH = cup.offsetHeight;
        const slotW = slotEl.offsetWidth, slotH = slotEl.offsetHeight;
        if (!cupH || !slotH) return;

        const c = offsetIn(cup, pin);
        const sPos = offsetIn(slotEl, pin);

        target.x = (sPos.x + slotW / 2) - (c.x + cupW / 2);
        target.y = (sPos.y + slotH / 2) - (c.y + cupH / 2);
        target.scale = slotH / cupH;

        /* The waiting cup used to park level with the centre cup, which put
           it right beside the callout column. It now sits HIGHER and SMALLER
           so it reads as “next up” without crowding the text. */
        preview.x = pin.offsetWidth * (narrow ? 0.34 : 0.37);
        preview.y = -pin.offsetHeight * (narrow ? 0.16 : 0.22);
        preview.scale = narrow ? 0.17 : 0.19;
      };
      measure();

      /* ── the master scrub ── */
      const SEG = 3.5;          // scroll units per flavour segment (text wipes in by 0.45, hand-off at 0.70)
      const TRAVEL = 3.2;       // film -> story handoff (slow, smooth descent)
      const FILM = 7.6;         // the padel film scrubs over this stretch (~3 screens)
      const HOLD = FILM + 0.2;  // last frame holds a short beat before the cup lifts
      const n = STORY_ORDER.length;
      const per = touch ? 1.15 : 1.75;
      const total = window.innerHeight * per * (n + 0.55) + window.innerHeight * (touch ? 2.2 : 2.7);
      const base = HOLD + TRAVEL;
      const handoffAt = (i) => base + i * SEG + SEG * 0.70;

      /* Deterministic state: which flavour / which counter number belongs to
         a given playhead time. Called from the timeline's own onUpdate, so
         it is identical scrolling down and scrolling up. */
      /* flip the counter and the palette in the MIDDLE of the hand-off, not
         at its first frame — otherwise the new number appears while the old
         panel is still fading out and the two disagree for a beat. */
      const segAt = (t) => {
        let idx = 0;
        for (let i = 0; i + 1 < n; i++) if (t >= handoffAt(i) + SEG * 0.16) idx = i + 1;
        return idx;
      };
      /* ── sound ──
         The track used to be seek-scrubbed: every scroll tick nudged
         currentTime and a 220ms timer paused it again, so on a phone it was
         play/seek/pause several times a second — crackle rather than a
         soundtrack. Worse, it armed itself on the first tap ANYWHERE on the
         page (including the menu button), at full volume, with no control to
         turn it off, because the Sound button had been deleted from the
         markup while its stylesheet rule stayed behind.

         It is an ambient bed now: silent until asked for, faded up over
         ~0.8s, left to run at its own pace, and faded back down when the
         film leaves the screen. Nothing seeks. */
      const audio = audioRef.current;
      const soundBtn = soundRef.current;
      const VOL = 0.55;
      let soundOn = false, inFilm = true, fade;
      if (audio) { audio.loop = true; audio.volume = 0; }

      const fadeTo = (v, d) => {
        fade?.kill();
        fade = gsap.to(audio, {
          volume: v, duration: d, ease: 'power2.out',
          onComplete: () => { if (v === 0) audio.pause(); }
        });
      };
      const applySound = () => {
        if (!audio) return;
        if (soundOn && inFilm) {
          audio.muted = false;
          audio.play().catch(() => {});               // ignored if the tap was not trusted
          fadeTo(VOL, 0.8);
        } else if (!audio.paused) {
          fadeTo(0, 0.5);
        }
      };
      const toggleSound = () => {
        soundOn = !soundOn;
        soundBtn.classList.toggle('is-on', soundOn);
        soundBtn.setAttribute('aria-pressed', String(soundOn));
        const label = soundBtn.querySelector('span');
        if (label) label.textContent = soundOn ? 'Sound on' : 'Sound';
        applySound();
      };
      soundBtn?.addEventListener('click', toggleSound);

      const syncState = () => {
        const t = tl.time();
        paintFilm(t / FILM);
        /* while the film is on screen the header sits on dark court footage
           and the sound bed is allowed to play; past it, both hand back */
        const onFilm = t < FILM + 0.6;
        if (onFilm !== inFilm) {
          inFilm = onFilm;
          document.body.classList.toggle('is-onfilm', onFilm);
          applySound();
        }
        const handed = t >= FILM - 0.001;
        gsap.set(cup, { opacity: handed ? 1 : 0 });
        const id = STORY_ORDER[segAt(t)];
        if (activeRef.current !== id) setFlavor(id, { duration: 0.9 });
        const el = idxRef.current;
        if (el) {
          const txt = FLAVORS[id].index;
          if (el.textContent !== txt) el.textContent = txt;
        }
      };

      const tl = gsap.timeline({
        onUpdate: syncState,
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=' + total,
          pin: pin,
          pinSpacing: true,
          /* a thumb-flick ends abruptly, so 1.1s of scrub left the film
             running for a beat after the finger stopped and it read as lag.
             Tighter on touch, unchanged on a wheel. */
          scrub: touch ? 0.55 : 1.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: measure,
          onUpdate: (self) => {
            const p = document.getElementById('storyProg');
            if (p) p.style.transform = `scaleX(${self.progress})`;
          }
        }
      });

      /* HALF 1 holds, then exits */
      tl.to({}, { duration: HOLD });
      tl.to('.hfilm__cue', { opacity: 0, duration: 0.3 }, 0.02);
      tl.to(vcan, { opacity: 0, duration: TRAVEL * 0.7, ease: 'power2.inOut' }, HOLD + TRAVEL * 0.15);
      /* the sound control belongs to the film — it leaves with it */
      tl.to('.hfilm__sound', { autoAlpha: 0, duration: TRAVEL * 0.4 }, HOLD + TRAVEL * 0.15);

      /* THE TRAVEL — the same cup descends into the centre of half 2 */
      tl.to(cup, {
        x: () => target.x,
        y: () => target.y,
        scale: () => target.scale,
        rotation: 0,
        duration: TRAVEL,
        ease: 'power2.inOut'
      }, HOLD);

      /* half 2 fades up behind it */
      tl.to(storyLayer.current, { opacity: 1, duration: TRAVEL * 0.6 }, HOLD + TRAVEL * 0.35);
      tl.to(bigLines, {
        yPercent: 0, duration: TRAVEL * 0.7, ease: 'expo.out', stagger: 0.09
      }, HOLD + TRAVEL * 0.4);

      /* HALF 2 — flavour segments. The cups do not rotate and the liquid
         does not move; the only motion is the straight horizontal hand-off
         and the callouts wiping in. */
      const cupEls = [cup, ...queueRefs.slice(0, n - 1).map((r) => r.current)];
      const boxEls = [leadBoxRef.current, ...queueRefs.slice(0, n - 1).map((r) => r.current)];

      // the waiting cups sit small at mid-right, invisible until cued
      cupEls.slice(1).forEach((_, k) => { const i = k + 1;
        gsap.set(cupEls[i], {
          x: () => preview.x, y: () => preview.y,
          scale: () => preview.scale, opacity: 0
        });
      });

      /* the nav's "Most Loved" link needs the scroll position where half 2
         starts, not the top of the section — expose it */
      window.__mostLovedY = () => {
        const st = tl.scrollTrigger;
        if (!st) return 0;
        const frac = (HOLD + TRAVEL * 0.92) / tl.duration();
        return st.start + (st.end - st.start) * frac;
      };

      STORY_ORDER.forEach((id, i) => {
        const panel = panels[i];
        const at = base + i * SEG;

        /* panel in / panel out — real tweens, so they undo cleanly */
        tl.set(panel, { autoAlpha: 1 }, at + 0.01);

        const callouts = panel ? panel.querySelectorAll('.callout') : [];
        callouts.forEach((c, k) => {
          tl.fromTo(c,
            { opacity: 0, x: 44, clipPath: 'inset(0 100% 0 0)' },
            { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: SEG * 0.20, ease: 'power2.out' },
            at + SEG * 0.05 + k * (SEG * 0.19));
        });

        /* reveal the NEXT cup, small at mid-right, while this one holds */
        if (i + 1 < n) {
          tl.to(cupEls[i + 1], { opacity: 1, duration: SEG * 0.3, ease: 'power1.out' },
            at + SEG * 0.14);
        }

        /* ── the hand-off ── */
        if (i + 1 < n) {
          const hAt = handoffAt(i);

          // outgoing cup leaves straight out of the left edge
          tl.to(boxEls[i], {
            xPercent: -190, opacity: 0, duration: SEG * 0.30, ease: 'power1.inOut'
          }, hAt);

          // incoming cup drops from its perch onto the slot and matches size
          tl.to(cupEls[i + 1], {
            x: 0, y: 0, scale: 1, duration: SEG * 0.30, ease: 'power1.inOut'
          }, hAt);

          tl.to(panel, { autoAlpha: 0, duration: SEG * 0.16 }, hAt);
        }
      });

      /* the last cup is the one the board section picks up — publish the
         exact screen box it occupies at the end of the pin so the flight
         never has to guess (see Menu.jsx) */
      window.__storyCupRect = () => {
        /* the LAST story cup, not the generic slot marker: every drink is
           photographed at its own aspect ratio now, so the cup that flies
           into the board is not the same width as the marker. */
        const slotEl = cupEls[cupEls.length - 1] || slotRef.current;
        if (!slotEl || !pin) return null;
        const w = slotEl.offsetWidth, h = slotEl.offsetHeight;
        if (!w || !h) return null;
        /* At the end of the pin the stage is flush with the top-left of the
           viewport, so the slot's OFFSET inside the stage is its screen box.
           (Do not assume the slot is dead-centre — on phones it is nudged up
           to leave room for the callouts.) */
        const o = offsetIn(slotEl, pin);
        return { left: o.x, top: o.y, width: w, height: h };
      };

      document.body.classList.add('is-onfilm');

      let rt;
      const onResize = () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
          /* rotating the phone changes which cut fits — swap before measuring
             so the cup box is placed against the frame that is actually up */
          const next = heroFilm();
          if (next.seq !== view.seq) { view = next; loadView(); }
          measure();
        }, 180);
      };
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        soundBtn?.removeEventListener('click', toggleSound);
        document.body.classList.remove('is-onfilm');
        fade?.kill();
        audio?.pause();
        window.__storyCupRect = null;
      };
    }, rootRef);

    return () => ctx.revert();
  }, [setFlavor]);

  /* A hero-only drink picked from the flavour menu simply swaps the lead
     cup's photo. (It used to repaint a canvas.) */
  useEffect(() => {
    const img = leadImgRef.current;
    if (!img) return;
    const d = ALL_DRINKS[activeRef.current];
    if (!d?.still) return;
    const next = import.meta.env.BASE_URL + d.still + assetV();
    if (img.getAttribute('src') !== next) img.setAttribute('src', next);
  });

  const lead = HERO_ROW.find((c) => c.lead);

  return (
    <section className="herostory" id="hero" ref={rootRef}>
      <div className="herostory__pin" ref={pinRef}>

        {/* ── HALF 1 ── the padel film, full bleed ── */}
        <div className="half half--hero half--film" ref={heroLayer}>
          <h1 className="sr-only">The Yard — specialty coffee drive-thru at SPARK, Sharjah</h1>
          <canvas className="hfilm" ref={videoRef} aria-hidden="true" />
          <div className="hfilm__cue" aria-hidden="true"><span>Scroll</span><i /></div>
          <button type="button" className="hfilm__sound" ref={soundRef}
            aria-pressed="false" aria-label="Toggle film sound">
            <i aria-hidden="true" /><span>Sound</span>
          </button>
          <audio ref={audioRef} src={`${import.meta.env.BASE_URL}assets/audio/padel.m4a`} preload="none" loop />
        </div>

        {/* ── HALF 2 ── same background, revealed by scroll ── */}
        <div className="half half--story" ref={storyLayer}>
          <div className="story__head">
            <span className="story__counter"><i ref={idxRef}>01</i><em>/ 04</em></span>
          </div>

          <h2 className="story__big" aria-hidden="true">
            <span className="sl"><span>{t('lovedBy')[0]}</span></span>
            <span className="sl"><span>{t('lovedBy')[1]}</span></span>
          </h2>

          <div className="caps" aria-hidden="true">
            <span className="cap cap--l"><img src={`${import.meta.env.BASE_URL}assets/stills/bean.webp${assetV()}`} alt="" /></span>
            <span className="cap cap--r"><img src={`${import.meta.env.BASE_URL}assets/stills/bean.webp${assetV()}`} alt="" /></span>
          </div>

          {STORY_ORDER.map((id) => (
            <div className="story__panel" key={id} data-flavor={id}>
              <div className="callouts">
                {FLAVORS[id].callouts.map((c) => (
                  <div className="callout callout--name" key={c.n}>
                    <span className="callout__n">{c.n}</span>
                    <h4>{c.h}</h4>
                    <p>{c.p}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="story__progress" aria-hidden="true"><span id="storyProg" /></div>
        </div>

        {/* invisible marker: the exact box a cup occupies in half 2 */}
        <div className="cupslot" ref={slotRef} aria-hidden="true" />

        {/* cups 2 and 3 wait here, small at mid-right, then match-and-move
            onto the slot as the previous cup exits left */}
        {STORY_ORDER.slice(1).map((id, i) => (
          <div className="scup" key={id} ref={queueRefs[i]} aria-hidden="true"
            style={{ '--ar': FLAVORS[id].ar }}>
            <img src={`${import.meta.env.BASE_URL}${FLAVORS[id].still}${assetV()}`} alt="" />
          </div>
        ))}

        {/* ── the cup row. The LEAD cup is the single element that travels
              from half 1 into half 2. ── */}
        <div className="hrow">
          {HERO_ROW.map((c) =>
            c.lead ? (
              <div className={`hcup hcup--lead hcup--film`} key={c.slot} ref={leadBoxRef}
                style={{ '--ar': ALL_DRINKS[c.drink].ar }}>
                <div className="hcup__inner" ref={leadRef}>
                  <img ref={leadImgRef}
                    src={`${import.meta.env.BASE_URL}${ALL_DRINKS[c.drink].still}${assetV()}`}
                    alt="The Yard iced coffee" />
                </div>
              </div>
            ) : (
              <div className={`hcup hcup--${c.slot} hcup--${c.row} hcup--side`} key={c.slot}
                style={{ '--ar': ALL_DRINKS[c.drink].ar }}>
                <img src={`${import.meta.env.BASE_URL}${ALL_DRINKS[c.drink].still}${assetV()}`}
                  alt={ALL_DRINKS[c.drink].name} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
