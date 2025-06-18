import fs from 'fs';

export function getGroupNames() {
  try {
    const raw = fs.readFileSync('./groups.txt', 'utf-8');
    return raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  } catch (err) {
    console.error('❌ Error leyendo groups.txt:', err.message);
    return [];
  }
}
