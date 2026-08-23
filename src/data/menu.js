/* ══════════════════════════════════════════════════════════════════════
   THE YARD — the complete menu.

   Scraped from their own Drivu ordering page and kept verbatim: every
   category, every item, their own descriptions (blank where they left it
   blank), and their own photograph background-removed. Three items have no
   product shot on Drivu — they fall back to the palm mark rather than
   borrowing someone else's picture.

   Prices are deliberately absent: Drivu does not publish them on the public
   page, so inventing them would be lying to a customer. Every card opens the
   order sheet, which hands you to the app where the live price lives.
   ══════════════════════════════════════════════════════════════════ */

/* Cold Drinks leads: the cup that flies out of section two and lands in the
   board is the Acai Smoothie, and it is a cold drink. Acai leads Cold Drinks
   for the same reason — the flight needs a target that is on screen at
   pan position zero. */
export const MENU_CATEGORIES = [
  {
    id: "cold-drinks", name: "Cold Drinks",
    items: [
      { n: "Acai Smoothie", d: "", img: "assets/stills/y-233827-dsc04357-1-jpg.webp", ar: 0.801 },
      { n: "Hibiscus", d: "", img: "assets/stills/y-233828-dsc04356-jpeg.webp", ar: 0.725 },
      { n: "Mango Frappe", d: "", img: "assets/stills/y-284416-img-3907-jpg.webp", ar: 0.7684 },
      { n: "Sharjah cloud", d: "", img: "assets/stills/y-293500-img-3906-jpg.webp", ar: 0.983 },
      { n: "Taro Shake", d: "", img: "assets/stills/y-281013-dsc04364-jpg.webp", ar: 0.79 },
      { n: "Iced Salted Chocolate", d: "", img: "assets/stills/y-234408-dsc04354-jpg.webp", ar: 0.792 },
      { n: "Cascara Peach", d: "", img: "assets/stills/y-258174-dsc04362-jpg.webp", ar: 0.769 },
      { n: "Cascara", d: "", img: "assets/stills/y-258173-dsc04350-jpeg.webp", ar: 0.784 },
      { n: "Purple Fizz", d: "", img: "assets/stills/y-233826-dsc04353-1-jpg.webp", ar: 0.79 },
    ]
  },
  {
    id: "matcha", name: "Matcha",
    items: [
      { n: "Strawberry Matcha", d: "Ceremonial matcha, milk of choice and strawberry foam.", img: "assets/stills/y-235590-dsc04347-1-jpg.webp", ar: 0.78 },
      { n: "Cheesecake Matcha", d: "", img: "assets/stills/y-275914-dsc04406-jpeg.webp", ar: 0.902 },
      { n: "Salted Vanilla Foam Matcha", d: "", img: "assets/stills/y-234407-dsc04346-jpeg.webp", ar: 0.787 },
      { n: "Iced Coconut Matcha Latte", d: "", img: "assets/stills/y-233824-img-0598-jpg.webp", ar: 0.754 },
      { n: "Mango Matcha", d: "", img: "assets/stills/y-249493-dsc04348-jpeg.webp", ar: 0.783 },
      { n: "Iced Regular Matcha Latte", d: "", img: "assets/stills/y-233823-dsc04347-1-copy-jpeg.webp", ar: 0.781 },
      { n: "Hot Matcha Latte", d: "", img: "assets/stills/y-233825-dsc04559-1-jpg.webp", ar: 0.747 },
    ]
  },
  {
    id: "cold-coffee", name: "Cold Coffee",
    items: [
      { n: "Iced Americano with Raspberry", d: "Ethiopia Hambela, Notes: peach iced tea, mango, blackberry, pineapple", img: "assets/stills/y-257877-img-1620-jpeg.webp", ar: 0.7104 },
      { n: "Iced Spanish Latte", d: "", img: "assets/stills/y-233837-img-6477-jpeg.webp", ar: 0.765 },
      { n: "Iced Latte", d: "", img: "assets/stills/y-233834-img-6477-jpeg.webp", ar: 0.765 },
      { n: "Iced Americano", d: "", img: "assets/stills/y-233831-img-6469-jpeg.webp", ar: 0.778 },
      { n: "Dirty Espresso", d: "", img: null, ar: null },
      { n: "Affogato", d: "", img: null, ar: null },
    ]
  },
  {
    id: "hot-coffee", name: "Hot Coffee",
    items: [
      { n: "Hot Spanish Latte", d: "", img: "assets/stills/y-233838-dsc04378-jpeg.webp", ar: 0.73 },
      { n: "Flat White", d: "", img: "assets/stills/y-233836-dsc04378-jpeg.webp", ar: 0.73 },
      { n: "Spanish Cortado", d: "", img: "assets/stills/y-235591-dsc04382-jpeg.webp", ar: 0.733 },
      { n: "Hot Latte", d: "", img: "assets/stills/y-233835-dsc04380-jpeg.webp", ar: 0.7836 },
      { n: "Cortado", d: "", img: "assets/stills/y-235592-dsc04386-jpeg.webp", ar: 0.7821 },
      { n: "Cappuccino", d: "", img: "assets/stills/y-233839-dsc04380-1-jpeg.webp", ar: 0.7836 },
      { n: "Espresso", d: "", img: "assets/stills/y-235593-dsc04388-jpeg.webp", ar: 0.8082 },
      { n: "Piccolo", d: "", img: "assets/stills/y-233833-img-0604-jpg.webp", ar: 0.7713 },
      { n: "Hot Americano", d: "", img: "assets/stills/y-233832-img-0602-jpg.webp", ar: 0.7483 },
    ]
  },
  {
    id: "manual-brew", name: "Manual Brew",
    items: [
      { n: "V60 Colombian Tropical Popsicle", d: "", img: "assets/stills/y-294211-thumb-img-6468-jpeg.webp", ar: 0.7651 },
      { n: "Iced V60 Ethiopia with Raspberry", d: "Peach,Lychee,Mandarine,earl grey :Micro lots Reserve Score 89+", img: "assets/stills/y-248901-dsc04400-jpeg.webp", ar: 0.734 },
      { n: "Iced V60 Tobacco", d: "", img: "assets/stills/y-275618-dsc04404-jpeg.webp", ar: 0.685 },
      { n: "V60 Villa Rosita", d: "Peach iced tea, Nectarine, Starfruit, Cantaloupe,vanilla : -Micro Lot Reserve:-89+", img: "assets/stills/y-280387-280387-hot-v60-villa-rosita-38-jpg.webp", ar: 0.778 },
      { n: "V60 Ethiopia", d: "Notes : Peach , Lychee , Mandarine , earl grey:Micro Lots Reserve Score 89+", img: "assets/stills/y-243973-img-6468-jpeg.webp", ar: 0.766 },
      { n: "V60 Brazil", d: "cherry,Blueberry,apple,chocolate:filter Roast Profile", img: "assets/stills/y-235769-img-6468-jpeg.webp", ar: 0.766 },
    ]
  },
  {
    id: "pastries-pudding", name: "Pastries | Pudding",
    items: [
      { n: "The Tennis Ball", d: "Our padel dessert: a tennis-ball mousse on a crunchy crumble base, with a chocolate racket. Served in the tray.", img: "assets/stills/y-tennisball-dessert.webp", ar: 1.373 },
      { n: "Banana Pudding", d: "", img: "assets/stills/y-237241-img-6486-jpeg.webp", ar: 0.488 },
      { n: "Aseeda", d: "", img: "assets/stills/y-233822-dsc04450-1-jpg.webp", ar: 0.777 },
      { n: "Mini Aseeda", d: "", img: "assets/stills/y-235589-dsc04572-jpeg.webp", ar: 0.739 },
      { n: "Signature Cinnamon Roll", d: "", img: "assets/stills/y-233817-dsc04485-jpeg.webp", ar: 0.8849 },
      { n: "Plain Cinnamon Roll", d: "", img: "assets/stills/y-233818-dsc04515-jpeg.webp", ar: 0.9494 },
      { n: "Chocolate Fondant", d: "", img: "assets/stills/y-233821-dsc04453-jpeg.webp", ar: 0.879 },
      { n: "Chocolate Chips Cookies", d: "", img: "assets/stills/y-234411-dsc04524-jpeg.webp", ar: 1.1883 },
      { n: "Rangeena Cookies (Dates)", d: "", img: "assets/stills/y-234887-dsc04522-jpeg.webp", ar: 1.2479 },
      { n: "Triple Chocolate Cookies", d: "", img: "assets/stills/y-234410-dsc04525-jpeg.webp", ar: 1.2108 },
      { n: "Brownie Tiramisu", d: "", img: null, ar: null },
    ]
  },
  {
    id: "breakfast", name: "Breakfast",
    items: [
      { n: "Avo Egg Toast", d: "Homemade guacamole with poached egg on a toasted sourdough bread slice.", img: "assets/stills/y-278645-dsc04410-jpeg.webp", ar: 1.415 },
      { n: "PB & Jam Toast", d: "A toasted sourdough slice of bread with homemade granola and raspberry jam.", img: "assets/stills/y-278649-dsc04422-jpeg.webp", ar: 1.5063 },
      { n: "Avo Feta Toast", d: "Homemade guacamole topped with feta cheese, grilled cherry tomato, and pomegranate on a toasted sourdough", img: "assets/stills/y-278646-dsc04424-jpeg.webp", ar: 1.4965 },
      { n: "3 Cheese Egg Bun", d: "A creamy (Parmesan, cheddar, mozzarella) scrambled egg with turkey strips in a soft brioche bun.", img: "assets/stills/y-278648-img-9311-jpg.webp", ar: 0.99 },
      { n: "Mushroom Truffle Toast", d: "A creamy truffle sauce and truffle mushroom scrambled egg on brioche bread.", img: "assets/stills/y-278650-dsc04428-jpg.webp", ar: 1.152 },
      { n: "Turkey and Cheese Sandwich", d: "", img: "assets/stills/y-269582-dsc04432-1-jpeg.webp", ar: 1.259 },
      { n: "Halloumi Avocado Sandwich", d: "", img: "assets/stills/y-269581-dsc04429-jpeg.webp", ar: 1.037 },
      { n: "Tomato Cheese Sandwich", d: "", img: "assets/stills/y-269583-dsc04434-jpeg.webp", ar: 1.339 },
      { n: "Spicy Tuna Sandwich", d: "A spicy Sriracha mayonnaise tuna mix in brown panini bread.", img: "assets/stills/y-278651-img-9251-jpg.webp", ar: 1.5743 },
      { n: "Caramelized Onion Egg Bun", d: "A creamy scrambled egg with spring onion and crunchy caramelized onion in a soft brioche bun.", img: "assets/stills/y-278647-dsc04425-jpg.webp", ar: 0.9408 },
      { n: "mushroom Florentine Benedict", d: "Poached egg on an English muffin & saut\u00e9ed spinach and Mushroom topped with hollandaise sauce with balsamic dressing salad on the side.", img: "assets/stills/y-278655-dsc04421-jpeg.webp", ar: 1.01 },
      { n: "Turkey Benedict", d: "Poached egg on an English muffin and turkey strips topped with hollandaise sauce with balsamic dressing salad", img: "assets/stills/y-278654-dsc04415-jpeg.webp", ar: 1.102 },
      { n: "Chia Pudding", d: "", img: "assets/stills/y-270757-dsc04549-jpeg.webp", ar: 0.91 },
    ]
  },
  {
    id: "bowl", name: "Bowl",
    items: [
      { n: "Berry Greek Yogurt Bowl", d: "Mixed berry flavored yogurt with banana, homemade granola, lotus seeds, fresh berries, and peanut butter.", img: "assets/stills/y-278657-img-9317-jpg.webp", ar: 0.975 },
      { n: "Honey Cinnamon Yogurt Bowl", d: "Honey and cinnamon flavored Greek yogurt with crushed mixed nuts, chia seeds, banana, and strawberries.", img: "assets/stills/y-278658-img-9315-jpg.webp", ar: 0.987 },
      { n: "Smoothie Crunch Granola Bowl", d: "Granola topped with mixed berry & banana smoothie, topped with peanut butter, coconut & chia seeds", img: "assets/stills/y-278660-img-9320-jpg.webp", ar: 0.977 },
    ]
  },
  {
    id: "the-yard-x-du", name: "The Yard x Du",
    items: [
      { n: "Hibiscus Cooler", d: "Brewed hibiscus tea chilled over ice, agave, squeeze of lime and strawberry garnish.", img: "assets/stills/y-288778-chatgpt-image-jul-3-2026-10-38-40-pm-.webp", ar: 0.642 },
      { n: "Bellini", d: "Sparkling soda, peach puree and strawberry syrup.", img: "assets/stills/y-288779-chatgpt-image-jul-3-2026-10-36-45-pm-.webp", ar: 0.65 },
      { n: "Strawberry Matcha Latte", d: "Ceremonial matcha, milk of choice and strawberry foam.", img: "assets/stills/y-288777-chatgpt-image-jul-3-2026-10-43-25-pm-.webp", ar: 0.662 },
      { n: "Salted Vanilla Matcha Latte", d: "Ceremonial grade matcha, milk of choice and salted vanilla foam.", img: "assets/stills/y-288776-chatgpt-image-jul-3-2026-10-51-08-pm-.webp", ar: 0.657 },
      { n: "Iced Matcha Latte", d: "Ceremonial grade matcha, milk of choice and slightly sweetened.", img: "assets/stills/y-288775-chatgpt-image-jul-3-2026-10-50-01-pm-.webp", ar: 0.668 },
      { n: "Mocha Piccolo", d: "Espresso, chocolate syrup and milk served piccolo style.", img: "assets/stills/y-288774-chatgpt-image-jul-3-2026-10-46-03-pm-.webp", ar: 0.776 },
      { n: "Coconut Cortado", d: "Espresso and coconut milk", img: "assets/stills/y-288772-chatgpt-image-jul-3-2026-10-30-18-pm-.webp", ar: 0.737 },
      { n: "Iced Vanilla Almond Piccolo", d: "Almond milk, espresso and salted vanilla foam.", img: "assets/stills/y-288770-chatgpt-image-jul-3-2026-10-45-03-pm-.webp", ar: 0.7605 },
      { n: "Salted Vanilla Spanish Latte", d: "Espresso, full fat milk, condensed milk, salted vanilla foam, caramel drizzle and sea salt flakes.", img: "assets/stills/y-288769-chatgpt-image-jul-3-2026-10-32-04-pm-.webp", ar: 0.667 },
      { n: "Cortado", d: "Espresso, steamed milk and natural honey.", img: "assets/stills/y-288768-chatgpt-image-jul-3-2026-10-30-18-pm-.webp", ar: 0.737 },
    ]
  },
];

/* The site shows the board in two halves: drinks after the story (Matcha
   first — the Strawberry Matcha cup flies out of the story into it), then
   sweet things after the padel-ball break (The Tennis Ball dessert first). */
const byId = (id) => MENU_CATEGORIES.find((c) => c.id === id);
export const DRINK_CATEGORIES = ['matcha', 'cold-drinks', 'cold-coffee', 'hot-coffee', 'manual-brew'].map(byId);   // Yard x Du dropped from the site at the client's request
export const SWEET_CATEGORIES = ['pastries-pudding', 'breakfast', 'bowl'].map(byId);

export const MENU_FLAT = MENU_CATEGORIES.flatMap((c) => c.items.map((i) => ({ ...i, cat: c.name })));

/* Drivu's own "people mostly buy" trio, by name. */
export const TOP_SELLERS = ['Acai Smoothie', 'Iced V60 Tobacco', 'Flat White'];
