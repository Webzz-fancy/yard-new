import { createContext, useContext, useCallback, useMemo, useRef, useState } from 'react';
import { ALL_DRINKS, FLAVORS } from '../data/flavors';
import { tweenPalette } from '../lib/palette';

const Ctx = createContext(null);

export function FlavorProvider({ children }) {
  const [active, setActive] = useState('raspberry');
  const activeRef = useRef('raspberry');

  const setFlavor = useCallback((id, opts = {}) => {
    const d = ALL_DRINKS[id];
    if (!d) return;
    if (activeRef.current === id && !opts.force) return;
    activeRef.current = id;
    setActive(id);
    tweenPalette(d.palette, opts.duration ?? 0.75);
  }, []);

  const value = useMemo(
    () => ({ active, setFlavor, activeRef, drink: ALL_DRINKS[active], FLAVORS }),
    [active, setFlavor]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFlavor = () => useContext(Ctx);
