const { createRequire } = require('module');
const req = createRequire('C:/Users/nuke/Documents/buildwithlami/frontend/package.json');
const sharp = req('sharp');
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/nuke/Documents/buildwithlami/.tmp/shots';
const OUT = 'C:/Users/nuke/Documents/buildwithlami/frontend/public/images/projects/case';

const plan = {
  vonnex2x:  { slug: 'vonnex2x',  screens: ['dashboard','pos','bookings'], mobileScreens: ['dashboard','inventory','workers'] },
  tiabrand:  { slug: 'tiabrand',  screens: ['home','shop','product'],      mobileScreens: ['home','shop','product'] },
  wodibenuah:{ slug: 'wodibenuah',screens: ['home','vendors','register'],  mobileScreens: ['home','vendors','register'] },
  sourceline:{ slug: 'sourceline',screens: ['home','verify','portfolio'],  mobileScreens: ['home','verify','portfolio'] },
  eduflow:   { slug: 'eduflow',   screens: ['overview','exams','fees'],    mobileScreens: ['overview','fees','attendance'] },
  medios:    { slug: 'medios',    screens: ['landing','dashboard','claims'], mobileScreens: ['landing','dashboard','claims'] },
};

(async () => {
  let count = 0, totalBytes = 0;
  for (const [dir, cfg] of Object.entries(plan)) {
    const files = fs.readdirSync(path.join(SRC, dir));
    for (const f of files) {
      if (!f.endsWith('.png')) continue;
      const m = f.match(/^([dm]\d)-([a-z]+)-(desktop|mobile)\.png$/i);
      if (!m) { console.log('SKIP unmatched:', dir, f); continue; }
      const isMobile = f.includes('-mobile');
      const screen = m[2];
      const outName = `${cfg.slug}-${screen}-${isMobile ? 'mobile' : 'desktop'}.webp`;
      const inPath = path.join(SRC, dir, f);
      const outPath = path.join(OUT, outName);
      await sharp(inPath)
        .resize({ width: isMobile ? 780 : 1440, withoutEnlargement: true })
        .webp({ quality: isMobile ? 78 : 80 })
        .toFile(outPath);
      const sz = fs.statSync(outPath).size;
      totalBytes += sz; count++;
      console.log(`${outName}: ${(sz/1024).toFixed(0)}KB`);
    }
  }
  console.log(`\nDone: ${count} files, ${(totalBytes/1024/1024).toFixed(1)}MB total`);
})();
