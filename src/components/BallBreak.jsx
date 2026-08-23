import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getSequence, assetV } from '../lib/frames';
import { useLang } from '../hooks/useLang';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════════════════════════
   BallBreak — drinks → dessert, in one continuous move.

   1. EMERGE   the drinks board's cream is still on screen; a white court
               line draws across it and the film fades up through the cream
               (the court is *revealed*, not cut to).
   2. FILM     the client's second clip, scrubbed: the ball is struck, rolls,
               hits the tennis-ball dessert, the camera settles top-down.
   3. LIFT     on the last frame the canvas swaps to a tray-free plate and
               the real tray (cut out of that frame) takes over — same trick
               as the raspberry cup in the hero.
   4. DROP     as the pin releases, the tray flies down into the first card
               of the sweets board (the-yard handoff), then the card owns it.
   ══════════════════════════════════════════════════════════════════ */
const FW = 1280, FH = 720;
const START = 21;                                   // skip the serve — start with the ball already rolling in
const TRAY = { x: 486, y: 191, w: 318, h: 334 };     // tray box in the last frame

export default function BallBreak() {
  const ref = useRef(null);
  const pinRef = useRef(null);
  const canRef = useRef(null);
  const trayRef = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const root = ref.current, pin = pinRef.current, can = canRef.current, tray = trayRef.current;
    if (!root || !pin || !can || !tray) return;
    const touch = window.matchMedia('(hover: none)').matches;
    const film = getSequence('dessert', can);
    const plate = new Image();
    plate.src = `${import.meta.env.BASE_URL}assets/stills/dessert-plate.webp${assetV()}`;

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray('.break__h .w');
      gsap.set(words, { yPercent: 110 });
      gsap.set('.break__sub', { opacity: 0, y: 12 });
      gsap.set(tray, { opacity: 0 });

      const cover = () => {
        const sc = Math.max(can.offsetWidth / FW, can.offsetHeight / FH);
        return { sc, dx: (can.offsetWidth - FW * sc) / 2, dy: (can.offsetHeight - FH * sc) / 2 };
      };
      const draw = (img) => {
        const g = can.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(can.offsetWidth * dpr), h = Math.round(can.offsetHeight * dpr);
        if (can.width !== w || can.height !== h) { can.width = w; can.height = h; }
        if (!img?.complete || !img.naturalWidth) return false;
        const { sc, dx, dy } = cover();
        g.clearRect(0, 0, w, h);
        g.drawImage(img, dx * dpr, dy * dpr, FW * sc * dpr, FH * sc * dpr);
        return true;
      };
      let cur = -1, onPlate = false;
      const paint = (p) => {
        film._resolve?.();
        if (!film.count) return;
        if (p >= 1) { if (!onPlate) { onPlate = draw(plate); cur = -1; } return; }
        onPlate = false;
        const i = START + Math.round(Math.max(0, Math.min(1, p)) * (film.count - 1 - START));
        if (i === cur) return;
        if (draw(film.images[i])) cur = i;
      };
      const repaint = () => { if (onPlate) { onPlate = false; paint(1); } else { const c = Math.max(START, cur); cur = -1; paint((c - START) / Math.max(1, film.count - 1 - START)); } };

      /* the tray sits exactly over the tray in the last frame (viewport coords — the pin is full-screen there) */
      const trayInFilm = () => {
        const { sc, dx, dy } = cover();
        return { left: dx + TRAY.x * sc, top: dy + TRAY.y * sc, width: TRAY.w * sc, height: TRAY.h * sc };
      };
      const placeTray = () => gsap.set(tray, { ...trayInFilm(), x: 0, y: 0, scale: 1 });
      placeTray();

      ScrollTrigger.create({ trigger: root, start: 'top bottom+=150%', once: true, onEnter: () => film.load().then(repaint) });
      window.addEventListener('resize', () => { repaint(); placeTray(); });

      /* ── the pin: emerge → film → lift ── */
      const EMERGE = 0.14, FILM = 0.80;
      const tl = gsap.timeline({
        onUpdate: () => {
          const p = tl.progress();
          paint(p < EMERGE ? 0 : (p - EMERGE) / (FILM - EMERGE));
          const lifted = p >= FILM - 0.001;
          gsap.set(tray, { opacity: lifted ? 1 : 0 });
        },
        scrollTrigger: {
          trigger: root, start: 'top top',
          end: () => '+=' + window.innerHeight * (touch ? 2.2 : 2.8),
          pin, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
          onRefresh: placeTray
        }
      });
      tl.fromTo('.break__line', { scaleX: 0 }, { scaleX: 1, duration: EMERGE * 0.9, ease: 'power2.inOut' }, 0);
      tl.fromTo(can, { opacity: 0 }, { opacity: 1, duration: EMERGE, ease: 'power2.inOut' }, EMERGE * 0.35);
      tl.to('.break__line', { opacity: 0, duration: 0.05 }, EMERGE + 0.02);
      tl.to({}, { duration: 1 - EMERGE });
      tl.to(words, { yPercent: 0, duration: 0.12, ease: 'expo.out', stagger: 0.04 }, FILM + 0.01);
      tl.to('.break__sub', { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }, FILM + 0.1);

      /* ── the drop: the tray holds its spot as the pin lets go, then flies
            into the first sweets card as that card rises to the pills ── */
      /* NOTE: gsap.context scopes selector STRINGS to this section, so the
         sweets card must be looked up on the document explicitly */
      const target = () => document.querySelector('#sweets [data-drop-target]');
      const fit = (a, r) => {
        const pad = 18;
        const s = Math.min((r.width - pad * 2) / a.width, (r.height - pad * 2) / a.height);
        return { left: r.left + (r.width - a.width * s) / 2, top: r.top + (r.height - a.height * s) / 2, width: a.width * s };
      };
      ScrollTrigger.create({
        trigger: target(),
        start: 'top bottom',                 // the card enters from below
        end: 'top 150px',                    // …and parks under the pills
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const tg = target();
          if (!tg) return;
          const a = trayInFilm();
          const b = fit(a, tg.getBoundingClientRect());
          const e = gsap.parseEase('power2.inOut')(self.progress);
          gsap.set(tray, {
            left: a.left + (b.left - a.left) * e,
            top: a.top + (b.top - a.top) * e,
            width: a.width + (b.width - a.width) * e,
            height: 'auto',
            opacity: self.progress > 0.985 ? 0 : 1
          });
          tg.classList.toggle('is-landed', self.progress > 0.985);
        },
        onLeaveBack: () => { placeTray(); target()?.classList.remove('is-landed'); }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="break break--film" id="break" ref={ref} aria-label="Padel break">
      <div className="break__pin" ref={pinRef}>
        <i className="break__line" aria-hidden="true" />
        <canvas className="break__film" ref={canRef} aria-hidden="true" />
        <div className="break__copy">
          <h2 className="break__h">
            <span className="hl"><span className="w">{t('breakH')[0]}</span></span>
            <span className="hl"><span className="w">{t('breakH')[1]}</span></span>
          </h2>
          <p className="break__sub">{t('breakSub')}</p>
        </div>
      </div>
      {/* the tray that lifts off the film and drops into the sweets board */}
      <img className="trayflyer" ref={trayRef} src={`${import.meta.env.BASE_URL}assets/stills/tray-top.webp${assetV()}`} alt="" aria-hidden="true" />
    </section>
  );
}
