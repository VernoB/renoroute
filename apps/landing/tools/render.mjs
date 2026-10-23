// tools/render.mjs — tiny optional build step: renders src/*.template.html -> *.html with FR as the static default,
// and checks that FR and EN have exactly the same keys and that every template key exists.
// Usage: node tools/render.mjs   (Node 18+, no dependencies)
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(readFileSync('config.js', 'utf8'), ctx);
vm.runInContext(readFileSync('i18n.js', 'utf8'), ctx);
const C = ctx.window.RR_CONFIG, I = ctx.window.RR_I18N;

const fr = Object.keys(I.fr).sort(), en = Object.keys(I.en).sort();
const missEn = fr.filter((k) => !I.en[k]), missFr = en.filter((k) => !I.fr[k]);
if (missEn.length || missFr.length) { console.error('i18n key mismatch', { missEn, missFr }); process.exit(1); }

const vars = { appName: C.brand.name, contactEmail: C.contactEmail, legalEntity: C.brand.legalEntity, siteUrl: C.siteUrl,
  brandWordmark: `${C.brand.nameParts[0]}<span style="color:var(--color-primary-700)">${C.brand.nameParts[1]}</span>` };
const interp = (s) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
const escAttr = (s) => s.replace(/<[^>]+>/g, '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

for (const name of ['index', 'privacy', 'delete-account']) {
  let html = readFileSync(`src/${name}.template.html`, 'utf8');
  html = html.replace(/\{\{([ta]):([\w.]+)\}\}/g, (_, kind, key) => {
    if (I.fr[key] == null) { console.error(`Missing key ${key} in ${name}`); process.exit(1); }
    const v = interp(I.fr[key]);
    return kind === 'a' ? escAttr(v) : v;
  });
  html = interp(html);
  for (const m of html.matchAll(/data-i18n="([\w.]+)"/g)) if (I.fr[m[1]] == null) { console.error('Unknown key', m[1]); process.exit(1); }
  writeFileSync(`${name}.html`, html);
  console.log(`rendered ${name}.html`);
}
console.log(`i18n OK: ${fr.length} keys FR = EN`);
