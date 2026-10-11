import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const pages = (await readdir(root)).filter(file => file.endsWith('.html'));
const documents = new Map(await Promise.all(pages.map(async file => [file, await readFile(path.join(root, file), 'utf8')])));
for (const [file, html] of documents) {
  assert.doesNotMatch(html, /<!-- (SITE_HEADER|SITE_FOOTER|WHATSAPP_WIDGET) -->/, file);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, file + ': one H1');
  assert.equal((html.match(/<header class="site-header"/g) ?? []).length, 1, file + ': one header');
  assert.equal((html.match(/<footer class="site-footer"/g) ?? []).length, 1, file + ': one footer');
  assert.match(html, /<script type="module" src="script.js"><\/script>/, file);
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
    if (/^(?:[a-z]+:|\/\/)/i.test(raw)) continue;
    const [target, fragment] = raw.split('#');
    const local = decodeURIComponent(target.split('?')[0]);
    const destination = path.resolve(root, local || file);
    assert.ok(destination.startsWith(root), file + ': resource outside dist');
    await access(destination).catch(() => assert.fail(file + ': missing ' + raw));
    if (fragment && (local.endsWith('.html') || !local)) {
      const content = documents.get(local || file);
      assert.ok(content?.includes('id="' + decodeURIComponent(fragment) + '"'), file + ': missing anchor ' + raw);
    }
  }
}
for (const file of ['script.js', ...(await readdir(path.join(root, 'assets/js'))).map(file => 'assets/js/' + file)]) {
  const source = await readFile(path.join(root, file), 'utf8');
  for (const [, specifier] of source.matchAll(/(?:from\s+|import\()['"](\.[^'"]+)['"]/g)) {
    await access(path.resolve(root, path.dirname(file), specifier));
  }
}
console.log('Validated links, anchors, shared markup and module dependencies across ' + pages.length + ' pages.');
