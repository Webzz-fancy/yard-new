import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { QUOTES, SHOP } from '../data/flavors';
import { useLang } from '../hooks/useLang';

/* Two shelves of quote cards at staggered offsets drifting in opposite
   directions, pausing on hover. No centred quote, no star ratings. */
export default function Community() {
  const ref = useRef(null);
  const { t } = useLang();
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.shelf').forEach((shelf, ri) => {
        const dir = ri === 1 ? 1 : -1;
        const cards = shelf.querySelectorAll('.qcard');
        const oneSet = QUOTES.length / 2;
        let setWidth = 0;
        const gap = parseFloat(getComputedStyle(shelf).gap || 26);
        for (let i = 0; i < oneSet; i++) setWidth += cards[i].offsetWidth + gap;

        gsap.set(shelf, { x: dir === 1 ? -setWidth : 0 });
        const tw = gsap.to(shelf, {
          x: dir === 1 ? 0 : -setWidth,
          duration: 26 + ri * 6, ease: 'none', repeat: -1
        });
        shelf.addEventListener('mouseenter', () => gsap.to(tw, { timeScale: 0, duration: 0.5 }));
        shelf.addEventListener('mouseleave', () => gsap.to(tw, { timeScale: 1, duration: 0.7 }));
      });
      gsap.from('.community__title', {
        yPercent: 26, opacity: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 72%' }
      });
      gsap.from('.loveus', {
        y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.loveus', start: 'top 88%' }
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const rows = [QUOTES.slice(0, 4), QUOTES.slice(4)];
  return (
    <section className="community" id="community" ref={ref}>
      <div className="community__wash" aria-hidden="true" />
      <div className="community__head">
        <span className="section__lab">{t('reviewsLab')} · {SHOP.rating} ★ · {SHOP.reviewCount}</span>
        <h2 className="community__title">Straight from<br /><em>the reviews</em></h2>
      </div>
      <div className="shelves">
        {rows.map((row, ri) => (
          <div className="shelf" key={ri} style={{ marginLeft: ri === 1 ? '-8vw' : 0 }}>
            {[0, 1, 2].flatMap((rep) =>
              row.map((q, i) => (
                <blockquote className={`qcard qcard--kraft${i % 2 ? ' qcard--low' : ''}`}
                  key={`${rep}-${i}`} data-cursor="link">
                  <span className="qcard__top" aria-hidden="true"><span>The Yard</span><i className="palm" /><span>Google · 5 ★</span></span>
                  <p>{q.q}</p>
                  <footer><em>{q.a}</em></footer>
                </blockquote>
              ))
            )}
          </div>
        ))}
      </div>

      {/* ── Love us? → straight to Google reviews ── */}
      <div className="loveus loveus--band">
        <img className="loveus__palm" src={`${import.meta.env.BASE_URL}assets/stills/palm-cream.webp`} alt="" aria-hidden="true" />
        <div className="loveus__grid">
          <div className="loveus__left">
            <span className="loveus__lab">Google · {SHOP.rating} ★ · {SHOP.reviewCount} reviews</span>
            <h3 className="loveus__h">{t('loveUs')}</h3>
            <p className="loveus__p">{t('loveUsSub')}</p>
          </div>
          <div className="loveus__right">
            <span className="loveus__stars" aria-hidden="true">★★★★★</span>
            <a className="loveus__btn" href={SHOP.maps} target="_blank" rel="noreferrer noopener" data-cursor="cta">
              {t('loveUsBtn')} <i>→</i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
