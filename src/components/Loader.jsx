import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { getSequence, hasSeq } from '../lib/frames';

/* ══════════════════════════════════════════════════════════════════════
   Loader — a pane of frosted glass over the page.

   FRAME SOURCE: bean-crack -> assets/frames/bean-crack/

   The site is already mounted underneath this component, so the loader is
   literally a sheet of opaque frosted glass sitting on top of it. The
   sequence is deliberately plain:

     0.0 - 1.4s   an intact bean, centred, with a short rule filling below it
     1.4 - 2.6s   the bean parts cleanly down the middle — two halves, straight
                  apart, barely any rotation
     2.6 - 3.4s   the glass clears, and only then do the cups animate in

   Removed on purpose: the cream pour column (it read as a zigzag crack),
   the photographic backdrop, the particle burst and the bean shake. Each
   was fighting the calm the reference has.
   ══════════════════════════════════════════════════════════════════ */

export default function Loader({ onDone }) {
  const rootRef = useRef(null);
  const glassRef = useRef(null);
  const canvasRef = useRef(null);
  const pctRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) { onDone?.(); return; }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone?.();
      return;
    }

    const crack = getSequence('bean-crack', canvas);

    /* progress tracks real asset loading */
    const state = { shown: 0 };
    const prog = { crack: 0, fonts: 0, film: 0 };
    const paint = () => {
      const t = prog.crack * 0.2 + prog.fonts * 0.1 + prog.film * 0.7;
      gsap.to(state, {
        shown: t, duration: 0.5, ease: 'power2.out',
        onUpdate: () => {
          if (pctRef.current) pctRef.current.textContent = Math.round(state.shown * 100);
          if (barRef.current) barRef.current.style.transform = `scaleX(${state.shown})`;
        }
      });
    };

    const pCrack = hasSeq('bean-crack')
      ? crack.load((v) => { prog.crack = v; paint(); })
      : Promise.resolve();
    const pFonts = (document.fonts?.ready || Promise.resolve())
      .then(() => { prog.fonts = 1; paint(); });

    /* the padel film is the hero now — it must be fully in before the glass
       clears, or the first scroll would show blank frames */
    const pFilm = hasSeq('padel')
      ? getSequence('padel').load((v) => { prog.film = v; paint(); })
      : Promise.resolve();

    let tl;
    const ceiling = new Promise((r) => setTimeout(r, 2200));

    Promise.all([pFilm, Promise.race([Promise.all([pCrack, pFonts]), ceiling])]).then(() => {
      crack.setCanvas(canvas);
      crack.size();
      crack.draw(0);                              // frame 0 = the intact bean

      tl = gsap.timeline({ onComplete: () => onDone?.() });

      /* 1. bean settles in and simply sits there */
      tl.fromTo(canvas,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'power2.out' });
      tl.fromTo('.loader__rule',
        { scaleX: 0.1 }, { scaleX: 1, duration: 1.15, ease: 'power1.inOut' }, 0.15);
      tl.to({}, { duration: 0.35 });

      /* 2. it parts down the middle — nothing more than that */
      const cr = { f: 0 };
      tl.to(cr, {
        f: () => Math.max(0, crack.count - 1),
        duration: 1.2,
        ease: 'power1.inOut',
        onUpdate: () => crack.draw(Math.round(cr.f))
      });

      /* 3. the glass clears and the page is simply there */
      tl.to('.loader__meta, .loader__rule', { opacity: 0, duration: 0.4 }, '>-0.15');
      tl.to(canvas, { opacity: 0, duration: 0.5, ease: 'power2.in' }, '<');

      tl.to(glassRef.current, {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        webkitBackdropFilter: 'blur(0px)',
        duration: 0.85,
        ease: 'power2.inOut'
      }, '<0.05');
      tl.set(rootRef.current, { pointerEvents: 'none' }, '<');

      /* strictly sequential: the glass is fully gone BEFORE the cups move,
         so the entrance is never seen through a blur */
      tl.add(() => { window.__heroIntro?.(); });
    });

    return () => tl?.kill();
  }, [onDone]);

  return (
    <div className="loader" ref={rootRef}>
      <div className="loader__glass" ref={glassRef} aria-hidden="true" />
      <div className="loader__inner">
        <canvas className="loader__canvas" ref={canvasRef} width="560" height="340" />
        <span className="loader__rule"><i ref={barRef} /></span>
      </div>
      <div className="loader__meta">
        <span className="loader__word">The Yard &middot; ذا يارد</span>
        <span className="loader__count"><i ref={pctRef}>0</i><em>%</em></span>
      </div>
    </div>
  );
}
