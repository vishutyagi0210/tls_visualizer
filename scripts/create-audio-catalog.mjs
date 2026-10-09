import { writeFileSync } from 'node:fs';
import { changedCertificate, conclusion } from '../src/data/simpleStories.ts';
import { internalScenes, publicScenes } from '../src/data/flowScenes.ts';
import { audioKey } from '../src/data/narration.ts';
const catalog = {};
for (const text of [...internalScenes.flat().map(beat => beat.narration), ...publicScenes.flat().map(beat => beat.narration), changedCertificate, conclusion]) {
  const key = audioKey(text);
  if (catalog[key] && catalog[key] !== text) throw new Error('Audio key collision');
  catalog[key] = text;
}
writeFileSync(new URL('./narration-catalog.json', import.meta.url), JSON.stringify(catalog, null, 2) + '\n');
console.log(`Prepared ${Object.keys(catalog).length} simple story passages.`);
