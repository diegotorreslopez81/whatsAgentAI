import { remove as removeDiacritics } from 'diacritics';

export async function getRecentMessages(client, chatName, limit = 50) {
  const maxRetries = 5;
  let chats = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      chats = await client.getChats();
      break;
    } catch (e) {
      console.warn(`🔁 Reintento ${attempt}/${maxRetries} al obtener chats: ${e.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (!chats) {
    throw new Error(`Error al obtener los chats tras ${maxRetries} intentos.`);
  }

  console.log(`🔍 Buscando chat o grupo con nombre "${chatName}"...`);
  const normalize = str => removeDiacritics(str.toLowerCase().trim());

  // Listado de nombres accesibles
  const available = chats.map(c =>
    `- ${c.isGroup ? '[Grupo] ' : '[Contacto] '}${c.name}`
  );
  // console.log('📋 Chats disponibles:\n' + available.join('\n'));

  const chat = chats.find(c =>
    typeof c.name === 'string' &&
    normalize(c.name) === normalize(chatName) &&
    typeof c.fetchMessages === 'function'
  );

  if (!chat) {
    throw new Error(`Chat o grupo "${chatName}" no encontrado o no accesible.`);
  }

  let messages;
  try {
    messages = await chat.fetchMessages({ limit });

    if (!Array.isArray(messages)) {
      throw new Error('fetchMessages no devolvió una lista válida.');
    }
  } catch (e) {
    throw new Error(`Error al obtener mensajes de "${chatName}": ${e.message}`);
  }

  const parsed = messages
    .filter(msg => msg && msg.body && typeof msg.body === 'string' && msg.body.trim() !== '')
    .map(msg => {
      const sender =
        msg._data?.notifyName ||
        msg.author ||
        msg.from ||
        'Desconocido';
      return `${sender}: ${msg.body}`;
    });

  if (parsed.length === 0) {
    throw new Error(`"${chatName}" no contiene mensajes válidos para resumir.`);
  }

  return parsed;
}
