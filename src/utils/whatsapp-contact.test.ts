import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildWhatsAppUrl,
  normalizeWhatsAppPhone,
  WHATSAPP_CONTACT_COPY,
} from '@/utils/whatsapp-contact';

test('normalizeWhatsAppPhone strips non-digits including plus', () => {
  assert.equal(normalizeWhatsAppPhone('+7 777 123 45 67'), '77771234567');
});

test('buildWhatsAppUrl uses wa.me without plus', () => {
  assert.equal(buildWhatsAppUrl('+77771234567'), 'https://wa.me/77771234567');
});

test('buildWhatsAppUrl adds encoded message when provided', () => {
  const url = buildWhatsAppUrl('77771234567', 'Сәлем!');
  assert.match(url, /^https:\/\/wa\.me\/77771234567\?text=/);
});

test('missing phone copy is calm Kazakh', () => {
  assert.match(WHATSAPP_CONTACT_COPY.missingPhoneTitle, /WhatsApp/);
});
