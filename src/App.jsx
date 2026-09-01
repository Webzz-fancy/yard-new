import { useCallback, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { loadManifest, warmSequence, getSequence } from './lib/frames';
import { heroFilm } from './lib/film';
import { releasePage } from './lib/pageReady';
import { setPaletteInstant } from './lib/palette';
import { FLAVORS, STORY_ORDER } from './data/flavors';
import { FlavorProvider } from './hooks/useFlavor';
import { LangProvider, useLang } from './hooks/useLang';
import { ScrollTrigger as ST } from 'gsap/ScrollTrigger';
import { useLenis, lenis } from './hooks/useLenis';

import Header from './components/Header';
import HeroStory from './components/HeroStory';
import Menu from './components/Menu';
import BallBreak from './components/BallBreak';
import { DRINK_CATEGORIES, SWEET_CATEGORIES } from './data/menu';
import Community from './components/Community';
import Footer from './components/Footer';
import StoreModal from './components/StoreModal';

gsap.registerPlugin(ScrollTrigger);
window.ScrollTrigger = ST;

function Menus() {
  const { t } = useLang();
  const [d1, d2] = t('drinksTitle');
  const [s1, s2] = t('sweetsTitle');
  return (
    <>
      <Menu id="menu" title={<>{d1} <em>{d2}</em></>} categories={DRINK_CATEGORIES} note={t('menuNote')} />
      <BallBreak />
      <Menu id="sweets" title={<>{s1} <em>{s2}</em></>} categories={SWEET_CATEGORIES} note={t('menuNote')} />
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);   // manifest loaded
  const [done, setDone] = useState(false);     // welcome cleared, page released
  useLenis(ready);


  useEffect(() => {
    /* key off STORY_ORDER, not a hard-coded id — renaming the lead drink
       silently blew up the whole app last time */
    setPaletteInstant(FLAVORS[STORY_ORDER[0]].palette);
    document.body.classList.add('is-loading');
    /* No loading page for now: the padel film is warmed silently, then the
       page opens straight on frame one. */
    /* Release the page as soon as the first fifth of the hero film is in —
       the rest streams in behind the scroll (frames paint as they land).
       Waiting for all 240 frames was ~9 s of blank page on a phone. */
    let released = false;
    const release = () => { if (!released) { released = true; onLoaderDone(); } };

    /* Render and unlock even when the assets never turn up. Without the
       manifest there is no frame scrub, so the hero holds its poster still —
       but every word, photo and link is there and the page scrolls. */
    const bootAnyway = () => { setReady(true); release(); };

    /* NOTHING may leave the page locked. body.is-loading sets
       overflow:hidden and only onLoaderDone takes it off, so anything that
       stalled this chain produced a blank cream page that could not be
       scrolled — indistinguishable from a broken site. A 404 on the manifest
       did it; so does an image that fires neither load nor error, which is
       what a dying mobile connection tends to produce. Opening early is
       safe: frames paint as they land. */
    const failsafe = setTimeout(bootAnyway, 8000);

    loadManifest()
      .then(() => {
        setReady(true);
        /* ONLY the hero film loads now. The dessert sequence used to start in
           this same tick, and its 8 MB fought the hero film for the phone's
           one connection — 13.8 MB over 250 requests before the first screen
           could resolve. It is not seen until ~9000px down the page, so it
           waits until the opening is in. */
        return getSequence(heroFilm().seq).load((p) => { if (p >= 0.2) release(); });
      })
      .then(() => { release(); warmSequence('dessert'); })
      .catch((err) => {
        console.error('[boot] assets unavailable — opening the page without the film', err);
        bootAnyway();
      })
      .finally(() => clearTimeout(failsafe));
  }, []);

  const onLoaderDone = useCallback(() => {
    document.body.classList.remove('is-loading');
    ScrollTrigger.refresh();
    setDone(true);
    /* Anything that has to wait for the page to open subscribes to this
       instead of being poked by name. Components that mount AFTER the
       release still get called — see lib/pageReady.js. */
    releasePage();
  }, []);

  return (
    <LangProvider>
    <FlavorProvider>
      <div className="grain" aria-hidden="true" />
      <div className="ambient" aria-hidden="true">
        <span className="ambient__blob ambient__blob--a" />
        <span className="ambient__blob ambient__blob--b" />
      </div>
      {ready && (
        <>
          <Header />
          <main id="top">
            <HeroStory />
            <Menus />
            <Community />
          </main>
          <Footer />
          <StoreModal />
        </>
      )}
    </FlavorProvider>
    </LangProvider>
  );
}
