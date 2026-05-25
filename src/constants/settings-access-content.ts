import { kk, FAMILY_LANGUAGE } from '@/content/family-language';

export const SETTINGS_ACCESS_COPY = {
  buttonLabel: {
    kk: 'Баптаулар',
    ru: 'Настройки',
  },
  buttonHint: {
    kk: 'Отбасы баптаулары',
    ru: 'Настройки семьи',
  },
} as const;

export const ELDER_MODE_RESET_COPY = {
  resetToNormal: {
    kk: 'Қалыпты режимге қайту',
    ru: 'Вернуть обычный режим',
  },
  resetToNormalHint: {
    kk: 'Үлкен әріп пен қарапайым экранды өшіру',
    ru: 'Отключить крупный текст и упрощённый экран',
  },
  resetConfirmTitle: kk(FAMILY_LANGUAGE.elderMode.title),
  resetConfirmMessage: {
    kk: 'Қалыпты режимге ораласыз ба?',
    ru: 'Вернуться к обычному режиму?',
  },
} as const;
