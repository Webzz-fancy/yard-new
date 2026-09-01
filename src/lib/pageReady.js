/* ══════════════════════════════════════════════════════════════════════
   pageReady.js — one signal for "the loader has let go of the page".

   WHY THIS EXISTS
     App releases the page as soon as a fifth of the hero film is in. That
     can happen BEFORE the components that care have mounted — on a warm
     cache it almost always does. Poking globals at release time
     (window.__heroIntro?.(), lenis()?.start()) meant the call landed on
     undefined and was silently swallowed by the optional-call, which cost
     us two separate bugs:

       · the hero film never faded in — a blank cream first screen
       · Lenis was created already stopped and never started, and a stopped
         Lenis calls preventDefault() on touchmove, so the phone could not
         scroll at all

     Both were timing-dependent, which is why they looked intermittent and
     never showed up on a desktop.

   THE CONTRACT
     Subscribers registered BEFORE the release are called at release;
     subscribers registered AFTER it are called immediately. Either order
     works, so no one has to win a race.
   ══════════════════════════════════════════════════════════════════ */

let released = false;
let waiters = [];

export const isPageReleased = () => released;

/** Run fn when the page is released — or right now if it already was. */
export function onPageReleased(fn) {
  if (released) { fn(); return () => {}; }
  waiters.push(fn);
  return () => { waiters = waiters.filter((w) => w !== fn); };
}

export function releasePage() {
  if (released) return;
  released = true;
  const run = waiters;
  waiters = [];
  run.forEach((fn) => fn());
}
