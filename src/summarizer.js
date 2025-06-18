import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config(); // <- Asegura que .env se cargue correctamente

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeMessages(messages) {
  const content = messages.join('\n');

  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'Eres un asistente que resume conversaciones de WhatsApp de forma clara y muy estructurada. Tu tarea es convertir mensajes informales en un resumen útil y operativo para una persona ocupada.',
      },
      {
        role: 'user',
        content: `
Aquí tienes los mensajes del grupo:

${content}

Resume el contenido dividiendo la información en estas 4 secciones (no añadas explicaciones):


✅ Acciones a realizar o seguimiento:
- ...

💡 Ideas o propuestas:
- ...

🗒️ Temas tratados relevantes:
- ...

📅 Elementos a agendar o decisiones tomadas:
- ...

No inventes contenido. Si una sección no tiene nada, simplemente no la pongas.
`.trim(),
      },
    ],
  });

  return chatCompletion.choices[0].message.content.trim();
}
