import fs from 'fs';
const cachePath = './cache/hashes.json';

export function loadHashes() {
  try {
    const data = fs.readFileSync(cachePath);
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export function saveHash(groupName, hash) {
  const hashes = loadHashes();
  hashes[groupName] = hash;
  fs.mkdirSync('./cache', { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(hashes, null, 2));
}
