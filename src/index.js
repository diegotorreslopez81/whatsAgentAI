import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
dotenv.config();
const { Client, LocalAuth } = pkg;
const ignoreRepeat = process.env.IGNORE_REPEAT === 'true';

import { getRecentMessages } from './whatsapp.js';
import { summarizeMessages } from './summarizer.js';
import { sendEmail } from './emailer.js';
import { hashMessages } from './utils/hash.js';
import { loadHashes, saveHash } from './utils/cache.js';
import { getGroupNames } from './utils/config.js';

const GROUP_NAMES = getGroupNames();

function createClient() {
  return new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox'],
    },
  });
}

async function runSummarizer() {
  const client = createClient();

  client.on('qr', (qr) => {
    console.log('📱 Escanea este código QR con tu WhatsApp Web:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', async () => {
    console.log('✅ WhatsApp conectado.');
    console.log('⏳ Esperando 3 segundos para asegurar carga completa...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const previousHashes = loadHashes();
    const summaries = [];

    try {
      for (const groupName of GROUP_NAMES) {
        try {
          console.log(`📥 Procesando grupo: ${groupName}`);

          const messages = await getRecentMessages(client, groupName, 50);
          const currentHash = hashMessages(messages);
          const lastHash = previousHashes[groupName];

          if (currentHash === lastHash && ignoreRepeat) {
            console.log(`🔁 Sin cambios en "${groupName}". Se omite.`);
            continue;
          }

          const summary = await summarizeMessages(messages);
          summaries.push(`📌 **${groupName}**\n${summary}`);
          saveHash(groupName, currentHash);

          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (groupError) {
          console.error(`❌ Grupo "${groupName}" falló:`);
          console.error(groupError.stack || groupError.toString());
        }
      }

      if (summaries.length > 0) {
        const finalSummary = summaries.join('\n\n────────────────────────\n\n');
        await sendEmail(finalSummary);
        console.log('📧 Email enviado con resúmenes de grupos con novedades.');
      } else {
        console.log('🟡 No hay novedades. No se envía email.');
      }

    } catch (error) {
      console.error('❌ Error crítico durante el procesamiento de los grupos:');
      console.error(error.stack || error.toString());
      console.error('🛑 Se aborta el envío de email.');
    } finally {
      client.destroy();
    }
  });

  client.initialize();
}

// Ejecutar al iniciar
runSummarizer();

// Ejecutar cada 12h
setInterval(() => {
  console.log('⏱️ Nueva ejecución automática...');
  runSummarizer();
}, 12 * 60 * 60 * 1000); // 12h