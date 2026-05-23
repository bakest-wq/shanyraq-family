import * as Clipboard from 'expo-clipboard';
import { Linking } from 'react-native';

const INVITE_PREFIXES = ['SHA', 'ATA', 'URP', 'QAS', 'NUR', 'TAY', 'KAS', 'ABA', 'SHN', 'BOT'] as const;

/** Example: SHA123, ATA777, URP456 */
export function generateInviteCode(): string {
  const prefix = INVITE_PREFIXES[Math.floor(Math.random() * INVITE_PREFIXES.length)];
  const digits = String(Math.floor(100 + Math.random() * 900));
  return `${prefix}${digits}`;
}

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function formatInviteCodeDisplay(code: string): string {
  const normalized = normalizeInviteCode(code);
  if (normalized.length === 6) {
    return `${normalized.slice(0, 3)}${normalized.slice(3)}`;
  }
  return normalized;
}

export function buildFamilyInviteMessage(familyName: string, inviteCode: string): string {
  const code = formatInviteCodeDisplay(inviteCode);

  return [
    'Ассалаумағалейкум! Присоединяйтесь к нашему семейному шежире…',
    '',
    `Отбасы: ${familyName}`,
    `Код приглашения: ${code}`,
    '',
    'Откройте Shanyraq Family → «Присоединиться к семье» и введите код.',
  ].join('\n');
}

export async function copyTextToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

export function openWhatsAppShare(message: string): void {
  Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
}
