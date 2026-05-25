import { Alert, Linking } from 'react-native';

export const WHATSAPP_CONTACT_COPY = {
  missingPhoneTitle: 'WhatsApp нөмірі көрсетілмеген',
} as const;

export function normalizeWhatsAppPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function buildWhatsAppUrl(phone: string, message?: string): string {
  const digits = normalizeWhatsAppPhone(phone);

  if (!digits) {
    return '';
  }

  const base = `https://wa.me/${digits}`;

  if (!message?.trim()) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

type OpenRelativeWhatsAppOptions = {
  phone?: string | null;
  name?: string;
  message?: string;
};

export function openRelativeWhatsApp({
  phone,
  name,
  message,
}: OpenRelativeWhatsAppOptions): void {
  const trimmed = phone?.trim();

  if (!trimmed) {
    Alert.alert(WHATSAPP_CONTACT_COPY.missingPhoneTitle);
    return;
  }

  const digits = normalizeWhatsAppPhone(trimmed);

  if (!digits) {
    Alert.alert(WHATSAPP_CONTACT_COPY.missingPhoneTitle);
    return;
  }

  const greeting =
    message ??
    (name ? `Ассалаумағалейкум, ${name}!` : 'Ассалаумағалейкум!');

  const url = buildWhatsAppUrl(trimmed, greeting);
  void Linking.openURL(url);
}
