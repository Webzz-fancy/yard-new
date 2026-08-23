import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* ══════════════════════════════════════════════════════════════════════
   useLang — English / Arabic toggle.

   The site's chrome (nav, buttons, section titles, footer labels) is
   translated here; the drink NAMES stay as Drivu lists them, which is
   English on their own menu too. Switching flips <html dir> so the layout
   mirrors, and a class on <body> lets the stylesheet swap the display
   font to the Arabic one.
   ══════════════════════════════════════════════════════════════════ */

const T = {
  en: {
    navMenu: 'Menu', navCollab: 'Collab with us', navEvents: 'Upcoming event', navLoyalty: 'Loyalty card',
    loveUs: 'Love us?', loveUsSub: 'Write a few words and let us know — it goes straight to our Google reviews.', loveUsBtn: 'Leave a Google review',
    reviewsLab: 'Straight from the reviews',
    welcome: 'Welcome', loading: 'Warming up…',
    order: 'Order on Drivu', orderShort: 'Order',
    lovedBy: ['LOVED', 'BY MANY'],
    drinksTitle: ['The', 'drinks'], sweetsTitle: ['Sweet', 'things'],
    menuNote: 'Tap a card for the details. Ordering happens on Drivu.',
    breakH: ['Game, set,', 'dessert.'],
    breakSub: 'The sweet things are next — starting with the one that looks like the ball.',
    driveLab: 'Drive-thru · SPARK, Sharjah', openDaily: 'Open daily', phoneOrders: 'phone orders',
    directions: 'Get directions', cue: 'Pull up. Give your name. Collect at the window.',
    seeYou: ['See you at', 'the window'],
    qCollab: 'Collab with us', qCollabS: 'Brands, events, padel clubs',
    qEvents: 'Upcoming pop-up events', qEventsS: 'MOTB, City Centre Al Zahia & more',
    qLoyal: 'Join the loyalty card', qLoyalS: 'Stamp every drink — the seventh is on us',
    findUs: 'Find us', talk: 'Talk to us', follow: 'Follow'
  },
  ar: {
    navMenu: 'القائمة', navCollab: 'تعاون معنا', navEvents: 'الفعالية القادمة', navLoyalty: 'بطاقة الولاء',
    loveUs: 'حبّيتونا؟', loveUsSub: 'اكتبوا لنا كلمتين — تروح مباشرة لتقييمات جوجل.', loveUsBtn: 'اكتب تقييم على جوجل',
    reviewsLab: 'من تقييمات جوجل',
    welcome: 'أهلاً وسهلاً', loading: 'لحظة…',
    order: 'اطلب عبر Drivu', orderShort: 'اطلب',
    lovedBy: ['الأكثر', 'طلباً'],
    drinksTitle: ['', 'المشروبات'], sweetsTitle: ['', 'الحلويات'],
    menuNote: 'اضغط على أي صنف للتفاصيل. الطلب يتم عبر Drivu.',
    breakH: ['لعبة، شوط،', 'حلا.'],
    breakSub: 'الحلويات بعد قليل — ونبدأ بالتي تشبه الكرة.',
    driveLab: 'درايف ثرو · سبارك، الشارقة', openDaily: 'يومياً', phoneOrders: 'طلبات هاتفية',
    directions: 'الاتجاهات', cue: 'قف عند النافذة. اذكر اسمك. استلم طلبك.',
    seeYou: ['نراكم عند', 'النافذة'],
    qCollab: 'تعاون معنا', qCollabS: 'علامات، فعاليات، نوادي بادل',
    qEvents: 'الفعاليات القادمة', qEventsS: 'MOTB، سيتي سنتر الزاهية والمزيد',
    qLoyal: 'انضم لبطاقة الولاء', qLoyalS: 'ختم مع كل مشروب — السابع علينا',
    findUs: 'موقعنا', talk: 'تواصل معنا', follow: 'تابعنا'
  }
};

const Ctx = createContext({ lang: 'en', t: (k) => T.en[k], toggle: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => (localStorage.getItem('yard-lang') === 'ar' ? 'ar' : 'en'));

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('is-ar', lang === 'ar');
    localStorage.setItem('yard-lang', lang);
    /* pinned sections measure themselves — let them re-measure after the flip */
    setTimeout(() => window.ScrollTrigger?.refresh?.(), 60);
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'ar' : 'en')), []);
  const t = useCallback((k) => T[lang][k] ?? T.en[k] ?? k, [lang]);
  const value = useMemo(() => ({ lang, t, toggle }), [lang, t, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
