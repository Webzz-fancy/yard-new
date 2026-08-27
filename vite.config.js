import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

/* The cups in the hero and the story half are photographs now — nothing in
   them animates on scroll — so the three 44-frame rotation sequences are no
   longer fetched by anything. They are still kept in public/assets/frames
   (nothing is deleted from the project), but shipping 5 MB the browser will
   never request is silly, so they are dropped from dist/ and from the
   manifest that dist/ serves. Add a name back to KEEP the moment a sequence
   is used again. */
const USED_SEQUENCES = ['bean-crack', 'padel', 'dessert'];   // padel = the hero film

/* Legacy stills from the fictional-roastery draft. They stay in
   public/assets/stills (nothing is deleted from the project) but there is
   no reason to ship them: every cup on the site is now a `y-` photograph
   of one of The Yard's real drinks. */
const LEGACY_STILLS = ['latte', 'matcha', 'rose', 'orange', 'blueberry',
                       'mango', 'watermelon', 'shop', 'mocha'];

/* Which stills does the source actually reference? Building the whole menu
   left a pile of duplicate cut-outs behind (the same photo saved under two
   names), and shipping them is pure weight. Anything the source never names
   is dropped from dist/ — the file itself stays in public/. */
function referencedStills(srcDir) {
  const names = new Set();
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) walk(f);
      else if (/\.(jsx?|css)$/.test(e.name)) {
        const txt = fs.readFileSync(f, 'utf8');
        /* not just .webp — the kiosk footer background is a .jpg, and matching
           only webp silently pruned it out of every deploy */
        for (const m of txt.matchAll(/([A-Za-z0-9._-]+\.(?:webp|jpe?g|png|svg|avif))/g)) names.add(m[1]);
      }
    }
  };
  walk(srcDir);
  return names;
}

function pruneUnusedSequences() {
  return {
    name: 'bb-prune-unused-sequences',
    apply: 'build',
    closeBundle() {
      const out = path.resolve(__dirname, 'dist');
      const manifestPath = path.join(out, 'assets', 'manifest.json');
      if (!fs.existsSync(manifestPath)) return;
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      let freed = 0;
      for (const name of Object.keys(m.sequences || {})) {
        if (USED_SEQUENCES.includes(name)) continue;
        const dir = path.join(out, m.sequences[name].dir.replace(/^assets\//, 'assets/'));
        if (fs.existsSync(dir)) {
          for (const f of fs.readdirSync(dir)) freed += fs.statSync(path.join(dir, f)).size;
          fs.rmSync(dir, { recursive: true, force: true });
        }
        delete m.sequences[name];
      }
      const stillDir = path.join(out, 'assets', 'stills');
      for (const name of LEGACY_STILLS) {
        const f = path.join(stillDir, name + '.webp');
        if (fs.existsSync(f)) { freed += fs.statSync(f).size; fs.rmSync(f); }
        if (m.stills) delete m.stills[name];
      }
      const used = referencedStills(path.resolve(__dirname, 'src'));
      let orphans = 0;
      if (fs.existsSync(stillDir)) {
        for (const f of fs.readdirSync(stillDir)) {
          if (used.has(f)) continue;
          freed += fs.statSync(path.join(stillDir, f)).size;
          fs.rmSync(path.join(stillDir, f));
          orphans++;
        }
      }
      if (orphans) console.log(`  dropped ${orphans} unreferenced stills`);
      fs.writeFileSync(manifestPath, JSON.stringify(m, null, 1));
      if (freed) console.log(`  pruned ${(freed / 1048576).toFixed(1)} MB of unused frame sequences`);
    }
  };
}

export default defineConfig({
  plugins: [react(), pruneUnusedSequences()],
  base: './',                 // relative paths so dist/ runs from any folder or file://
  server: {
    host: '0.0.0.0',
    port: 5173,
    // the sandbox preview is proxied through an e2b host, so allow it
    allowedHosts: true,
    cors: true
  },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: true },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1200
  }
});
