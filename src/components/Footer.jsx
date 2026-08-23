import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getSequence, hasSeq } from '../lib/frames';
import { SHOP, ORDER, storeLink } from '../data/flavors';
import { useLang } from '../hooks/useLang';

/* Closing scene. If the pour-drain sequence exists it is scroll-scrubbed on
   a canvas; until those plates are shot, a drifting particle field keeps the
   footer from sitting static. */
const COLS = [
  { lab: 'findUs', links: [
      { t: SHOP.area, href: SHOP.maps },
      { t: 'Near Innovation Street, University City', href: SHOP.maps }
  ] },
  { lab: 'talk', links: [
      { t: SHOP.phone, href: SHOP.phoneHref },
      { t: 'Get the Drivu app', href: storeLink() }
  ] },
  { lab: 'follow', links: [
      { t: '@the.yard.ae', href: ORDER.instagram },
      { t: `${SHOP.rating} on Google · ${SHOP.reviewCount} reviews`, href: SHOP.maps }
  ] }
];

/* TODO: swap for a real photo of the drive-thru lane at SPARK — Drivu's branch
   image is a pastry, not the lane. Film still used as the placeholder. */
const KIOSK_IMG = `${import.meta.env.BASE_URL}assets/stills/kiosk-night.jpg`;

const QUICK = [
  { id: 'collab', k: 'qCollab', ks: 'qCollabS', href: ORDER.instagram   /* DM on Instagram until a collab email is confirmed */ },
  { id: 'events', k: 'qEvents', ks: 'qEventsS', href: ORDER.instagram },
  { id: 'loyalty', k: 'qLoyal', ks: 'qLoyalS', href: ORDER.loyalty }
];

export default function Footer() {
  const ref = useRef(null);
  const pourRef = useRef(null);
  const steamRef = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const footer = ref.current;
    const touch = window.matchMedia('(hover: none)').matches;
    const ctx = gsap.context(() => {
      gsap.set('.fw > span', { yPercent: 108 });
      gsap.to('.fw > span', {
        yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.11,
        scrollTrigger: { trigger: '.footer__reveal', start: 'top 88%' }
      });
      gsap.from('.footer__col', {
        y: 34, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '.footer__cols', start: 'top 92%' }
      });
      gsap.from('.qlink', {
        y: 26, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: '.footer__quick', start: 'top 92%' }
      });

      /* ── the car: drives along the lane as the drive-thru block scrolls in,
         wheels turning, then idles with a gentle bob at the window ── */
      const car = footer.querySelector('.car');
      if (car) {
        const lane = footer.querySelector('.drive__lane');
        /* drive to the end of the lane — the kiosk is the next column over */
        /* SVGs have no offsetWidth — measure with rects */
        const dist = () => Math.max(120, lane.getBoundingClientRect().width - car.getBoundingClientRect().width + 10);
        gsap.fromTo(car, { x: 0 }, {
          x: dist, ease: 'power2.out',
          scrollTrigger: {
            trigger: '.drive', start: 'top 85%', end: 'top 25%', scrub: 1, invalidateOnRefresh: true,
            onUpdate: (self) => lane.classList.toggle('is-served', self.progress > 0.96)
          }
        });
        gsap.to('.car__wheel', {
          rotation: 360 * 6, ease: 'none', transformOrigin: '50% 50%',
          scrollTrigger: { trigger: '.drive', start: 'top 85%', end: 'top 25%', scrub: 1 }
        });
        gsap.to(car, { y: -2, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      }

      const cv = pourRef.current;
      if (cv && hasSeq('pour-drain')) {
        const seq = getSequence('pour-drain', cv);
        ScrollTrigger.create({
          trigger: footer, start: 'top bottom+=60%', once: true,
          onEnter: () => seq.load().then(() => { seq.size(); seq.draw(0); })
        });
        const fr = { i: 0 };
        gsap.to(fr, {
          i: () => Math.max(0, seq.count - 1), ease: 'none',
          onUpdate: () => seq.draw(Math.round(fr.i)),
          scrollTrigger: {
            trigger: footer, start: 'top 78%',
            end: touch ? 'top 8%' : 'top -12%', scrub: true, invalidateOnRefresh: true
          }
        });
      } else if (cv) {
        cv.style.display = 'none';
      }

      /* ambient particle field so the footer is never static */
      const sc = steamRef.current;
      if (!sc) return;
      const c2 = sc.getContext('2d');
      let W, H, dpr, parts = [], run = false, raf;
      const size = () => {
        const r = footer.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = r.width; H = r.height;
        sc.width = W * dpr; sc.height = H * dpr;
        c2.setTransform(dpr, 0, 0, dpr, 0, 0);
        parts = Array.from({ length: 40 }, () => ({
          x: Math.random() * W, y: Math.random() * H,
          r: gsap.utils.random(20, 90), v: gsap.utils.random(0.08, 0.3),
          a: gsap.utils.random(0.02, 0.07)
        }));
      };
      const tick = () => {
        if (!run) return;
        c2.clearRect(0, 0, W, H);
        parts.forEach((p) => {
          p.y -= p.v;
          if (p.y < -p.r) { p.y = H + p.r; p.x = Math.random() * W; }
          const g = c2.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `rgba(255,240,225,${p.a})`);
          g.addColorStop(1, 'rgba(255,240,225,0)');
          c2.fillStyle = g;
          c2.beginPath(); c2.arc(p.x, p.y, p.r, 0, Math.PI * 2); c2.fill();
        });
        raf = requestAnimationFrame(tick);
      };
      ScrollTrigger.create({
        trigger: footer, start: 'top bottom', end: 'bottom top',
        onToggle: (self) => {
          run = self.isActive;
          if (run) { size(); tick(); } else if (raf) cancelAnimationFrame(raf);
        }
      });
      window.addEventListener('resize', size);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <footer className="footer footer--kiosk" ref={ref} style={{ backgroundImage: `url(${KIOSK_IMG})` }}>
      <canvas className="footer__steam" ref={steamRef} aria-hidden="true" />
      <div className="footer__pour"><canvas ref={pourRef} aria-hidden="true" /></div>
      <div className="footer__reveal">
        <h2 className="footer__big">
          <span className="fw"><span>{t('seeYou')[0]}</span></span>
          <span className="fw fw--i"><span>{t('seeYou')[1]}</span></span>
        </h2>

        {/* ── drive-thru: details + quick links on the LEFT, the car pulling up
              to the window on the RIGHT ── */}
        {/* ── drive-thru on the kiosk illustration: car LEFT · details MIDDLE ── */}
        <div className="drive drive--v4">
          <div className="drive__car" aria-hidden="true">
            <div className="drive__lane">
              <i className="drive__road" />
              <svg className="car car--suv" viewBox="0 0 300 120">
                <path className="suv__body" d="M14 80V58c0-5 3-9 8-10l22-4 18-24c3-4 7-6 12-6h96c5 0 9 2 12 5l26 26 60 6c7 1 12 6 12 13v16c0 4-3 7-7 7H21c-4 0-7-3-7-7z"/>
                <path className="suv__glass" d="M66 46l15-20c2-2 4-3 7-3h42v23H66zm72 0V23h40c3 0 5 1 7 3l21 20H138z"/>
                <rect className="suv__trim" x="14" y="74" width="270" height="5" rx="2"/>
                <rect className="suv__light" x="272" y="58" width="12" height="8" rx="2"/>
                <rect className="suv__rack" x="78" y="14" width="110" height="4" rx="2"/>
                <g className="car__wheel" transform="translate(76 92)"><circle r="17" className="car__tyre"/><circle r="8" className="car__rim"/><path d="M-11 0h22M0-11v22" className="car__spoke"/></g>
                <g className="car__wheel" transform="translate(226 92)"><circle r="17" className="car__tyre"/><circle r="8" className="car__rim"/><path d="M-11 0h22M0-11v22" className="car__spoke"/></g>
                <g className="car__arm"><path d="M178 50v-9l12-3v12z" className="car__skin"/><rect x="188" y="30" width="10" height="13" rx="1.5" className="car__cupb"/><rect x="186" y="28" width="14" height="3" rx="1" className="car__cupb"/></g>
              </svg>
            </div>
          </div>

          <div className="drive__info">
            <span className="footer__lab">{t('driveLab')}</span>
            <p className="drive__h">{t('openDaily')}<br/><span dir="ltr">7:00 — 00:00</span></p>
            <p className="drive__p">{SHOP.area}<br/>Near Innovation Street, University City</p>
            <p className="drive__p"><a href={SHOP.phoneHref} className="flink" data-cursor="link" dir="ltr">{SHOP.phone}</a> · {t('phoneOrders')}</p>
            <div className="drive__actions">
              <a className="btn-orange" href={SHOP.maps} target="_blank" rel="noreferrer noopener" data-cursor="cta"><span>{t('directions')}</span></a>
              <a className="btn-line" href={ORDER.drivu} target="_blank" rel="noreferrer noopener" data-cursor="cta">{t('order')} →</a>
            </div>
          </div>
        </div>

        {/* ── quick links: small text, like any footer ── */}
        <nav className="footer__links" aria-label="Quick links">
          {QUICK.map((q) => (
            <a className="footer__link" id={q.id} key={q.k} href={q.href} target="_blank" rel="noreferrer noopener" data-cursor="link">{t(q.k)}</a>
          ))}
          <a className="footer__link" href={SHOP.maps} target="_blank" rel="noreferrer noopener" data-cursor="link">{t('findUs')}</a>
          <a className="footer__link" href={SHOP.phoneHref} data-cursor="link" dir="ltr">{SHOP.phone}</a>
        </nav>

        {/* ── socials: logos only ── */}
        <div className="socials" aria-label="Social media">
          <a className="social" href={ORDER.instagram} target="_blank" rel="noreferrer noopener" aria-label="Instagram" data-cursor="link">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>
          </a>
          <a className="social" href={SHOP.maps} target="_blank" rel="noreferrer noopener" aria-label="Google Maps" data-cursor="link">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-7.2 7-12.5A7 7 0 0 0 5 9.5C5 14.8 12 22 12 22z" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="9.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>
          </a>
          <a className="social" href={ORDER.drivu} target="_blank" rel="noreferrer noopener" aria-label="Drivu" data-cursor="link">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15l2-6a2 2 0 0 1 1.9-1.4h8.2A2 2 0 0 1 18 9l2 6v4H4v-4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="7.5" cy="17" r="1.6" fill="currentColor"/><circle cx="16.5" cy="17" r="1.6" fill="currentColor"/></svg>
          </a>
          <a className="social" href={ORDER.loyalty} target="_blank" rel="noreferrer noopener" aria-label="Loyalty card" data-cursor="link">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M3 10h18" stroke="currentColor" strokeWidth="1.8"/><circle cx="8" cy="15" r="1.3" fill="currentColor"/><circle cx="12" cy="15" r="1.3" fill="currentColor"/><circle cx="16" cy="15" r="1.3" fill="currentColor"/></svg>
          </a>
        </div>

        <div className="footer__base">
          <span>© 2026 {SHOP.name} · {SHOP.nameAr} · Sharjah</span>
          <span>Drive-thru · 7:00 — 00:00 daily</span>
        </div>
      </div>
    </footer>
  );
}
