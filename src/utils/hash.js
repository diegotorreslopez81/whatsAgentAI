import crypto from 'crypto';

export function hashMessages(messages) {
  const content = messages.join('\n');
  return crypto.createHash('sha256').update(content).digest('hex');
}
