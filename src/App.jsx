import { useCallback, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { loadManifest, warmSequence } from './lib/frames';
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
    loadManifest()
      .then(() => { setReady(true); return warmSequence('padel'); })
      .then(() => onLoaderDone());
  }, []);

  const onLoaderDone = useCallback(() => {
    document.body.classList.remove('is-loading');
    lenis()?.start();
    ScrollTrigger.refresh();
    setDone(true);
    window.__heroIntro?.();
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
