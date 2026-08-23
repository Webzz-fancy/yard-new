import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MENU_CATEGORIES as ALL_CATEGORIES } from '../data/menu';
import { ORDER } from '../data/flavors';
import { assetV } from '../lib/frames';
import { lenis } from '../hooks/useLenis';
import { useLang } from '../hooks/useLang';
import CupModal from './CupModal';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════════════════════════
   Menu — one category open at a time.

   Pills across the top. The selected category is fully expanded (every
   card visible, big photo); the others sit collapsed as a single bar with
   their name and count. Picking another pill — or clicking a collapsed bar
   — folds the open one and unfolds the new one with a smooth height tween,
   then the page is scrolled so the new block's head sits under the pills.
   Two instances: drinks (Matcha open first) and sweet things (Pastries
   open first).
   ══════════════════════════════════════════════════════════════════ */

const EASE = 'power3.inOut';

export default function Menu({
  id = 'menu',
  title = <>Everything <em>we make</em></>,
  categories: MENU_CATEGORIES = ALL_CATEGORIES,
  note = ''
} = {}) {
  const ref = useRef(null);
  const barRef = useRef(null);
  const groupRefs = useRef({});
  const bodyRefs = useRef({});
  const [open, setOpen] = useState(null);
  const [active, setActive] = useState(MENU_CATEGORIES[0].id);
  const { t } = useLang();
  const base = import.meta.env.BASE_URL;

  /* initial state: first category open, rest collapsed (no animation) */
  useEffect(() => {
    MENU_CATEGORIES.forEach((c, i) => {
      const body = bodyRefs.current[c.id];
      if (!body) return;
      gsap.set(body, { height: i === 0 ? 'auto' : 0, overflow: 'hidden' });
    });
    const ctx = gsap.context(() => {
      gsap.from(ref.current.querySelector('.menu__title'), {
        yPercent: 40, opacity: 0, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 70%' }
      });
      const first = bodyRefs.current[MENU_CATEGORIES[0].id];
      if (first) {
        gsap.from(first.querySelectorAll('.mcard'), {
          y: 28, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05,
          scrollTrigger: { trigger: first, start: 'top 82%' }
        });
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  const select = (cid) => {
    if (cid === active) return;
    const fromBody = bodyRefs.current[active];
    const toBody = bodyRefs.current[cid];
    const toGroup = groupRefs.current[cid];
    if (!fromBody || !toBody || !toGroup) return;

    setActive(cid);

    /* measure the incoming block's natural height, then tween both */
    gsap.set(toBody, { height: 'auto' });
    const h = toBody.offsetHeight;
    gsap.set(toBody, { height: 0 });

    const tl = gsap.timeline({
      onUpdate: () => ScrollTrigger.update(),
      onComplete: () => { gsap.set(toBody, { height: 'auto' }); ScrollTrigger.refresh(); }
    });
    tl.to(fromBody, { height: 0, duration: 0.55, ease: EASE }, 0);
    tl.to(toBody, { height: h, duration: 0.7, ease: EASE }, 0.08);
    tl.from(toBody.querySelectorAll('.mcard'), {
      y: 22, opacity: 0, duration: 0.55, ease: 'power3.out', stagger: 0.035
    }, 0.22);

    /* keep the new block's head under the sticky pills */
    const y = toGroup.getBoundingClientRect().top + window.scrollY - 128;
    const l = lenis();
    if (l) l.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  /* keep the active pill inside the scrollable bar */
  useEffect(() => {
    const bar = barRef.current?.querySelector('.catbar__inner');
    const chip = barRef.current?.querySelector('.catchip.is-on');
    if (!bar || !chip) return;
    const target =
      chip.getBoundingClientRect().left - bar.getBoundingClientRect().left +
      bar.scrollLeft - (bar.clientWidth - chip.offsetWidth) / 2;
    bar.scrollTo({ left: target, behavior: 'smooth' });
  }, [active]);

  return (
    <section className="menu menu--acc" id={id} ref={ref}>
      <div className="menu__head menu__head--stack">
        <div className="menu__headline">
          <h2 className="menu__title">{title}</h2>
          {note && <p className="menu__note">{note}</p>}
        </div>
      </div>

      <nav className="catbar catbar--sticky" ref={barRef} aria-label="Menu categories">
        <div className="catbar__inner">
          {MENU_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-current={active === c.id}
              className={`catchip${active === c.id ? ' is-on' : ''}`}
              data-cursor="link"
              onClick={() => select(c.id)}
            >
              {c.name}<em>{c.items.length}</em>
            </button>
          ))}
        </div>
      </nav>

      <div className="menu__acc">
        {MENU_CATEGORIES.map((c) => {
          const on = active === c.id;
          return (
            <div
              className={`mgroup mgroup--acc${on ? ' is-open' : ''}`}
              key={c.id}
              data-id={c.id}
              ref={(el) => { groupRefs.current[c.id] = el; }}
            >
              <button type="button" className="mgroup__bar" onClick={() => select(c.id)} aria-expanded={on} data-cursor="link">
                <span className="mgroup__barname">{c.name}</span>
                <span className="mgroup__barcount">{c.items.length}</span>
                <i className="mgroup__chev" aria-hidden="true" />
              </button>

              <div className="mgroup__body" ref={(el) => { bodyRefs.current[c.id] = el; }} aria-hidden={!on}>
                <div className="mgrid">
                  {c.items.map((it, idx) => (
                    <article className="mcard mcard--big" key={c.id + it.n} data-cursor="cup">
                      <div className="mcard__top" aria-hidden="true"><span>The Yard</span><i className="palm" /><span>{c.name}</span></div>
                      <button type="button" className="mcard__img mcard__img--btn"
                        data-drop-target={id === 'sweets' && c.id === MENU_CATEGORIES[0].id && idx === 0 ? '' : undefined}
                        onClick={() => setOpen({ name: it.n, d: it.d, img: it.img, cat: c.name })}
                        aria-label={`${it.n} — details`} tabIndex={on ? 0 : -1}>
                        {it.img
                          ? <img src={`${base}${it.img}${assetV()}`} alt={it.n} loading="lazy" decoding="async" />
                          : <span className="mcard__mark" aria-hidden="true" />}
                      </button>
                      <div className="mcard__foot mcard__foot--big">
                        <span className="mcard__name">{it.n}</span>
                        {it.d && <p className="mcard__desc">{it.d}</p>}
                        <a className="mcard__order" href={ORDER.drivu} target="_blank" rel="noreferrer noopener" data-cursor="cta" tabIndex={on ? 0 : -1}>
                          {t('order')} <i>→</i>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CupModal item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
