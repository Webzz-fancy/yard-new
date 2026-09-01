import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { isPageReleased, onPageReleased } from '../lib/pageReady';

gsap.registerPlugin(ScrollTrigger);

/* Smooth scrolling bridged into ScrollTrigger. Scroll stays locked until the
   loader finishes (see App.jsx). Native momentum is left alone on touch --
   syncing it fights the OS and feels worse than doing nothing. */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.45,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.5
    });
    window.__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    /* Scroll stays locked until the loader lets go — but the loader may
       have let go ALREADY (a warm cache releases almost immediately, before
       this effect runs). Starting stopped in that case left Lenis stopped
       for the whole visit, and a stopped Lenis calls preventDefault() on
       touchmove: the phone simply would not scroll. */
    let unsubscribe = () => {};
    if (isPageReleased()) lenis.start();
    else { lenis.stop(); unsubscribe = onPageReleased(() => lenis.start()); }

    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 260);
    };
    window.addEventListener('resize', onResize);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', onResize);
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [enabled]);
}

export const lenis = () => window.__lenis;
