#!/usr/bin/env node
/**
 * Module-boundary check (FRAMEWORK §7.2; owner: scaffold). Zero-dependency stand-in for an ESLint
 * `no-restricted-imports` config:  npm run lint
 *
 *   1. Token JSON (design-tokens/*.json) is imported only by src/motion/core/tokens.ts; everything
 *      else reads tokens through that module.
 *   2. React / Motion-for-React stay out of the React-free layers: motion/core, fx, booth,
 *      gift-schema, i18n.
 *   3. src/booth makes no network calls (no fetch / XMLHttpRequest / sendBeacon / @supabase).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|mjs|js)$/.test(n)) files.push(p);
  }
})(src);

const IMPORT = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|^\s*import\s*['"]([^'"]+)['"]/gm;
const REACT_FREE = ['motion/core', 'fx', 'booth', 'gift-schema', 'i18n'];
const errors = [];

for (const f of files) {
  const rel = relative(src, f).split('\\').join('/');
  const text = readFileSync(f, 'utf8');
  const specs = [...text.matchAll(IMPORT)].map((m) => m[1] ?? m[2] ?? m[3]);
  for (const s of specs) {
    if (/design-tokens\/[^/]*\.json$|^@tokens\/[^/]*\.json$/.test(s) && rel !== 'motion/core/tokens.ts') errors.push(`${rel}: imports ${s} (read tokens via src/motion/core/tokens.ts)`);
    if (REACT_FREE.some((d) => rel.startsWith(d + '/')) && (s === 'react' || s.startsWith('react/') || s === 'react-dom' || s.startsWith('motion/react'))) errors.push(`${rel}: imports ${s} in a React-free layer`);
    if (rel.startsWith('booth/') && s.startsWith('@supabase')) errors.push(`${rel}: imports ${s} (booth photos never leave the device)`);
  }
  if (rel.startsWith('booth/') && /\bfetch\s*\(|XMLHttpRequest|sendBeacon/.test(text.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''))) errors.push(`${rel}: network call in src/booth`);
}

if (errors.length) { console.error(errors.map((e) => '  ✗ ' + e).join('\n')); console.error(`${errors.length} boundary violation(s)`); process.exit(1); }
console.log(`boundaries ok (${files.length} files)`);
