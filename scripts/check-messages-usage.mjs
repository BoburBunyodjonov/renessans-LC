import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Static check: every `useTranslations('ns')` / `getTranslations({namespace})`
 * call in the codebase must only use keys that exist in messages/uz.json.
 * A missing key renders the raw key path in production instead of throwing.
 */
const root = path.join(process.cwd(), 'src');
const messages = JSON.parse(
  await readFile(path.join(process.cwd(), 'messages', 'uz.json'), 'utf8'),
);

const has = (namespace, key) => {
  let node = messages[namespace];
  for (const part of key.split('.')) {
    if (!node || typeof node !== 'object') return false;
    node = node[part];
  }
  return typeof node === 'string';
};

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(entry.name)) yield full;
  }
}

const problems = [];

for await (const file of walk(root)) {
  const source = await readFile(file, 'utf8');

  // Variable -> every namespace it is bound to in this file. A name can be
  // reused across functions (`t` in generateMetadata and in the component), so
  // a key counts as present when it exists in any of its bindings.
  const namespaces = new Map();
  const bind = (name, namespace) => {
    if (!name || !namespace) return;
    if (!namespaces.has(name)) namespaces.set(name, new Set());
    namespaces.get(name).add(namespace);
  };

  for (const m of source.matchAll(/const\s+(\w+)\s*=\s*useTranslations\(\s*'([^']+)'\s*\)/g)) {
    bind(m[1], m[2]);
  }
  for (const m of source.matchAll(
    /const\s+(\w+)\s*=\s*await\s+getTranslations\(\{[^}]*namespace:\s*'([^']+)'/g,
  )) {
    bind(m[1], m[2]);
  }
  // Destructured Promise.all results: `const [t, tNav] = await Promise.all([...getTranslations({namespace:'x'})...])`
  for (const block of source.matchAll(
    /const\s+\[([^\]]+)\]\s*=\s*await\s+Promise\.all\(\[([\s\S]*?)\]\);/g,
  )) {
    const names = block[1].split(',').map((n) => n.trim());
    const calls = [...block[2].matchAll(/getTranslations\(\{[^}]*namespace:\s*'([^']+)'/g)].map(
      (m) => m[1],
    );
    let callIndex = 0;
    for (const [i, entry] of block[2].split(/,\s*\n/).entries()) {
      if (entry.includes('getTranslations')) {
        bind(names[i], calls[callIndex]);
        callIndex++;
      }
    }
  }

  for (const [variable, bound] of namespaces) {
    const pattern = new RegExp(`\\b${variable}\\('([A-Za-z0-9_.]+)'`, 'g');
    for (const use of source.matchAll(pattern)) {
      const key = use[1];
      if (![...bound].some((namespace) => has(namespace, key))) {
        problems.push(`${path.relative(process.cwd(), file)}: ${[...bound].join('|')}.${key}`);
      }
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} missing message key(s):`);
  for (const problem of [...new Set(problems)]) console.error('  ' + problem);
  process.exit(1);
}
console.log('All translation keys used in components exist in messages/uz.json');
