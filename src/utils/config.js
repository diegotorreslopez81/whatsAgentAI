export function getGroupNames() {
  if (!process.env.GROUPS) {
    throw new Error('La variable de entorno GROUPS no está definida.');
  }
  return process.env.GROUPS.split(',').map(name => name.trim()).filter(Boolean);
}