import { cp, mkdir, readFile, readdir, rm, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from './components/render-page.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(root, 'dist');
const publicFiles = ['script.js', 'favicon.svg', 'robots.txt', 'sitemap.xml'];
const entries = await readdir(root, { withFileTypes: true });
const pages = entries.filter(entry => entry.isFile() && entry.name.endsWith('.html')).map(entry => entry.name).sort();
const styles = entries.filter(entry => entry.isFile() && entry.name.endsWith('.css')).map(entry => entry.name);
if (!pages.length) throw new Error('No HTML pages found in project root.');

// Validate and render every source before replacing the previous build.
const rendered = await Promise.all(pages.map(async page => [page, renderPage(page, await readFile(path.join(root, page), 'utf8'))]));
await Promise.all([...publicFiles, ...styles, 'assets'].map(file => access(path.join(root, file))));
// Only this project's fixed output directory may be removed recursively.
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Unsafe output directory.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(rendered.map(([page, html]) => writeFile(path.join(output, page), html)));
await Promise.all([...publicFiles, ...styles].map(file => cp(path.join(root, file), path.join(output, file))));
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
console.log('Built ' + pages.length + ' static pages into dist/.');
