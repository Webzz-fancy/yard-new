/* ══════════════════════════════════════════════════════════════════════
   THE YARD — ذا يارد
   Sharjah Research, Technology & Innovation Park

   Everything in this file is real. The drinks, the photographs and the
   descriptions come from their own Drivu ordering page; the reviews are
   verbatim Google reviews; the address, phone and hours are their listing.
   Nothing is invented — where a number could not be verified (item prices
   are not published on their public menu) it is simply not shown.

   Photography: their Drivu menu photos, background-removed and normalised
   to 1000px tall RGBA WebP. Every cup is one of their real branded cups.
   `ar` is the photo's own width/height — the layout sizes cups by HEIGHT
   and derives the width from this, so each drink keeps its true shape.
   ══════════════════════════════════════════════════════════════════ */

const S = 'assets/stills/';

/* The Yard's brand colours, sampled from their logo and cups. The accent
   (their sage green) is deliberately CONSTANT across every flavour — only
   the wash and the display type shift as you scroll. */
export const BRAND = {
  green: '#6E8B4F',
  greenDeep: '#4A5C34',
  cream: '#F3ECDD',
  ink: '#24291C'
};

export const ORDER = {
  ios: 'https://apps.apple.com/ae/app/drivu-your-drive-thru-orders/id1207582756',
  android: 'https://play.google.com/store/apps/details?id=co.m4.drivu',
  instagram: 'https://www.instagram.com/the.yard.ae/',
  /* their live Drivu menu — the only place that actually takes an order */
  drivu: 'https://drivu.co/DriveThru/The_Yard_BLrXY/Sharjah_Research_Technology_&_Innovation_Park',
  /* Farah loyalty card — their link-in-bio registration form */
  loyalty: 'https://farahcard.com/business/customer-registration-form/0vFAgktIS6QL1vYhKUBkBJ'
};

/* every "get the app" button points straight at a store listing — Android
   phones go to Google Play, everything else to the App Store. The whole
   menu now lives on this site, so nothing links out to the web menu. */
export const storeLink = () =>
  typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
    ? ORDER.android
    : ORDER.ios;

export const SHOP = {
  name: 'The Yard',
  nameAr: 'ذا يارد',
  area: 'Sharjah Research, Technology & Innovation Park',
  address: 'Near Innovation Street, University City\nSharjah, United Arab Emirates',
  phone: '+971 58 678 8470',
  phoneHref: 'tel:+971586788470',
  hours: 'Mon–Fri 8am–11pm\nSat & Sun 11am–11pm',
  rating: '4.7',
  reviewCount: '145',
  maps: 'https://maps.app.goo.gl/5wby2TkfLHsB8v8Q7'   /* their own link-in-bio pin */
};

/* ── the four the story runs through, in order ──
   raspberry -> iced V60 -> acai -> strawberry matcha.
   The raspberry cup is the one that lands out of the padel video. */
export const FLAVORS = {
  raspberry: {
    id: 'raspberry', index: '01', name: 'Iced Americano with Raspberry',
    tagline: 'Ethiopia Hambela over ice, with fresh raspberries.',
    still: S + 'y-raspberry-lead.webp', ar: 0.78,
    swatch: '#B8323F',
    palette: {
      '--bg': '#EBDCC3', '--bg-deep': '#3A1418', '--ink': '#24291C',
      '--accent': '#6E8B4F', '--glow': '#D9A08F', '--dim': '#8A7560',
      '--display': '#B5474F'
    },
    callouts: [
      { n: '01', h: 'Iced Americano with Raspberry', p: 'Ethiopia Hambela espresso pulled long over ice, with fresh raspberries in the cup. Notes of peach iced tea, mango, blackberry and pineapple.' }
    ]
  },
  v60: {
    id: 'v60', index: '02', name: 'Iced V60 Ethiopia',
    tagline: 'Hand-poured micro lot, chilled. Scored 89+.',
    still: S + 'y-248901-dsc04400-jpeg.webp', ar: 0.734,
    swatch: '#C47A3C',
    palette: {
      '--bg': '#F3E9D6', '--bg-deep': '#3D2410', '--ink': '#2A2318',
      '--accent': '#6E8B4F', '--glow': '#E0B27A', '--dim': '#8A7860',
      '--display': '#C4894E'
    },
    callouts: [
      { n: '02', h: 'Iced V60 Ethiopia', p: 'A reserve micro lot, hand-poured on a V60 and chilled. Peach, lychee, mandarin and a touch of earl grey. Cupping score 89+.' }
    ]
  },
  acai: {
    id: 'acai', index: '03', name: 'Acai Smoothie',
    tagline: 'No coffee in it at all. Thick enough for a spoon.',
    still: S + 'y-acai.webp', ar: 0.8,
    swatch: '#8A6B84',
    palette: {
      '--bg': '#F1ECE6', '--bg-deep': '#2C1F2C', '--ink': '#251E26',
      '--accent': '#6E8B4F', '--glow': '#B294A6', '--dim': '#7F7280',
      '--display': '#977B90'
    },
    callouts: [
      { n: '03', h: 'Acai Smoothie', p: 'A smooth, refreshing berry blend with a subtle touch of peanut butter \u2014 rich yet balanced. Fruity, creamy and cold. No coffee in it at all.' }
    ]
  },
  strawmatcha: {
    id: 'strawmatcha', index: '04', name: 'Strawberry Matcha',
    tagline: 'Ceremonial grade matcha under strawberry.',
    still: S + 'y-strawmatcha.webp', ar: 0.78,
    swatch: '#8FA65C',
    palette: {
      '--bg': '#F2F0E1', '--bg-deep': '#28331B', '--ink': '#222A18',
      '--accent': '#6E8B4F', '--glow': '#D6A2B4', '--dim': '#7C8168',
      '--display': '#9DB070'
    },
    callouts: [
      { n: '04', h: 'Strawberry Matcha', p: 'Ceremonial grade matcha whisked to order, with the milk of your choice and a strawberry foam on top.' }
    ]
  }
};

/* Hero-only drinks: a real cup in the row, no story segment of its own. */
export const HERO_EXTRAS = {
  cascarapeach: {
    id: 'cascarapeach', index: '04', name: 'Cascara Peach',
    tagline: 'Coffee cherry tea over peach. Bright and not sweet.',
    still: S + 'y-cascarapeach.webp', ar: 0.769,
    swatch: '#D98A45',
    heroOnly: true,
    palette: {
      '--bg': '#F5EBDA', '--bg-deep': '#40230C', '--ink': '#2A2318',
      '--accent': '#6E8B4F', '--glow': '#E0A46A', '--dim': '#8A7860',
      '--display': '#C4894E'
    }
  }
};

export const ALL_DRINKS = { ...FLAVORS, ...HERO_EXTRAS };

export const STORY_ORDER = ['raspberry', 'v60', 'acai', 'strawmatcha'];

/* The hero row, left to right. Slot 2 is the LEAD — the cup that travels
   into the second half of the section. */
export const HERO_ROW = [
  { slot: 'p2', row: 'up',  drink: 'raspberry', lead: true }
];

export const STATS = [
  { b: SHOP.rating, s: 'Google rating' },
  { b: SHOP.reviewCount, s: 'Reviews' },
  { b: '70+', s: 'On the menu' }
];

/* The board itself lives in data/menu.js — the complete Drivu menu,
   9 categories and 73 items. Section 3 renders all of it. */

/* ── real Google reviews (google.com/maps · The Yard ذا يارد) ── */
export const QUOTES = [
  { q: 'I get my coffee from this place every day — it’s my go-to spot in the building! The vibes are always positive, and every single staff member is genuinely friendly and smiling.',
    a: 'Shamsa A', m: 'Google · 5 stars' },
  { q: 'My favourite way to start the day. Their coffee is always top notch, rich and smooth just the way I like it, even the Matcha.',
    a: 'Hawra A', m: 'Google · 5 stars' },
  { q: 'Great service, great coffee and dessert. The chocolate fondant was so delicious. The place is so quiet and relaxing.',
    a: 'Zero', m: 'Google · 5 stars' },
  { q: 'Went with a cortado made with Brazilian beans. Smooth, well-balanced, and just the right strength. The coffee definitely speaks for itself.',
    a: 'Noura', m: 'Google · 5 stars' },
  { q: 'Amazing coffee, friendly and chill staff, and reasonable prices. Their sweets are delicious, and service is always quick.',
    a: 'Meshal A', m: 'Google · 5 stars' },
  { q: 'I had such a great experience. Glyce and Mathilda were so kind and friendly, and made everything smooth and enjoyable.',
    a: 'Abrar A', m: 'Google · 5 stars' },
  { q: 'Nice experience in a quiet place and delicious sweets. Thanks a lot to Zen for his service.',
    a: 'Osama S', m: 'Google · 5 stars' },
  { q: 'I’m also obsessed with their Aseeda and cinnamon roll — both are packed with flavour and feel like a warm hug in food form.',
    a: 'Hawra A', m: 'Google · 5 stars' }
];
