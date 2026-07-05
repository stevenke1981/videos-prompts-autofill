import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = path.join(projectRoot, 'dist');
const assetsDirectory = path.join(distDirectory, 'assets');
const maximumChunkBytes = 500 * 1024;
const baselineEntryBytes = 874_180;

const assetNames = await readdir(assetsDirectory);
const javascriptFiles = (
  await Promise.all(
    assetNames
      .filter((name) => name.endsWith('.js'))
      .map(async (name) => ({
        name,
        bytes: (await stat(path.join(assetsDirectory, name))).size,
      }))
  )
).sort((left, right) => right.bytes - left.bytes);

if (javascriptFiles.length === 0) {
  throw new Error('Bundle check failed: dist/assets contains no JavaScript files.');
}

console.table(javascriptFiles);

const indexHtml = await readFile(path.join(distDirectory, 'index.html'), 'utf8');
const entryNames = [
  ...indexHtml.matchAll(/<script[^>]+src=["'][^"']*\/assets\/([^"']+\.js)["']/g),
].map((match) => match[1]);
const entryFiles = javascriptFiles.filter(({ name }) => entryNames.includes(name));
const oversizedFiles = javascriptFiles.filter(({ bytes }) => bytes > maximumChunkBytes);

const failures = [];
if (entryFiles.length === 0) {
  failures.push('dist/index.html does not reference a JavaScript entry chunk.');
} else {
  const largestEntry = Math.max(...entryFiles.map(({ bytes }) => bytes));
  if (largestEntry >= baselineEntryBytes) {
    failures.push(
      `entry chunk is ${largestEntry} bytes; expected less than ${baselineEntryBytes} bytes`
    );
  }
}

if (oversizedFiles.length > 0) {
  failures.push(
    `chunks above ${maximumChunkBytes} bytes: ${oversizedFiles
      .map(({ name, bytes }) => `${name} (${bytes})`)
      .join(', ')}`
  );
}

if (failures.length > 0) {
  throw new Error(`Bundle check failed:\n- ${failures.join('\n- ')}`);
}

const largestEntry = Math.max(...entryFiles.map(({ bytes }) => bytes));
console.log(
  `Bundle check passed: ${javascriptFiles.length} chunks, largest entry ${largestEntry} bytes, limit ${maximumChunkBytes} bytes.`
);
