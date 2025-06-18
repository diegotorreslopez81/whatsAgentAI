import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(summary) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.EMAIL_TO,
      subject: '🧠 WhatsApp Summary by whatsAgentAI',
      text: summary,
    });

    if (error) {
      console.error('Error al enviar email:', error);
    } else {
      console.log('✅ Email enviado con éxito:', data);
    }
  } catch (err) {
    console.error('❌ Fallo general en envío con Resend:', err);
  }
}
