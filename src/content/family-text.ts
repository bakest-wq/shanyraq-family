import {
  FAMILY_LANGUAGE,
  bilingual,
  kk,
  phraseWithName,
  phraseWithToken,
  ru,
  type FamilyPhrase,
} from '@/content/family-language';

/** Kazakh-first copy — default for all family-facing UI. */
export function familyText(phrase: FamilyPhrase): string {
  return kk(phrase);
}

/** Russian companion line when bilingual UI is needed. */
export function familyTextRu(phrase: FamilyPhrase): string {
  return ru(phrase);
}

/** Kazakh + Russian, separated gently for elder readers who prefer both. */
export function familyTextBoth(phrase: FamilyPhrase, separator = ' · '): string {
  return bilingual(phrase, separator);
}

export function familyTextWithName(phrase: FamilyPhrase, name: string): string {
  return kk(phraseWithName(phrase, name));
}

export function familyTextWithToken(
  phrase: FamilyPhrase,
  token: string,
  value: string,
): string {
  return kk(phraseWithToken(phrase, token, value));
}

export function familyTextCount(phrase: FamilyPhrase, count: number): string {
  return familyTextWithToken(phrase, 'count', String(count));
}

export { FAMILY_LANGUAGE, bilingual, kk, ru, phraseWithName, phraseWithToken, type FamilyPhrase };
