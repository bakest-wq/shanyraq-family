import { bilingual, FAMILY_LANGUAGE, kk, phraseWithName, ru } from '@/content/family-language';

export const USER_IDENTITY_COPY = {
  screenTitle: bilingual(FAMILY_LANGUAGE.identity.screenTitle),
  intro: bilingual(FAMILY_LANGUAGE.identity.intro),
  existingOption: bilingual(FAMILY_LANGUAGE.identity.existingOption),
  existingHint: ru(FAMILY_LANGUAGE.identity.existingOption),
  addOption: bilingual(FAMILY_LANGUAGE.identity.addOption),
  addHint: ru(FAMILY_LANGUAGE.identity.addOption),
  pickSelfTitle: bilingual(FAMILY_LANGUAGE.identity.pickSelfTitle),
  pickSelfHint: ru(FAMILY_LANGUAGE.identity.pickSelfTitle),
  saveButton: bilingual(FAMILY_LANGUAGE.identity.saveButton),
  saveHint: ru(FAMILY_LANGUAGE.identity.saveButton),
  backToOptions: '← Басқа нұсқа таңдау',
  savedTitle: kk(FAMILY_LANGUAGE.success.identityLinked),
  savedMessage: (name: string) => kk(phraseWithName(FAMILY_LANGUAGE.success.identityLinkedMessage, name)),
  settingsButton: bilingual(FAMILY_LANGUAGE.identity.settingsButton),
  settingsHint: ru(FAMILY_LANGUAGE.identity.settingsButton),
  onboardingPrompt: kk(FAMILY_LANGUAGE.identity.onboardingPrompt),
  onboardingSubtext: bilingual(FAMILY_LANGUAGE.identity.onboardingPrompt),
  openWhoAmI: bilingual({ kk: 'Таңдау', ru: 'Выбрать' }),
  currentLinked: (name: string) => bilingual(phraseWithName(FAMILY_LANGUAGE.identity.currentLinked, name)),
  linkedLabel: bilingual(FAMILY_LANGUAGE.identity.linkedLabel),
  notLinked: bilingual(FAMILY_LANGUAGE.identity.notLinked),
} as const;

export { FAMILY_LANGUAGE, bilingual, kk, ru } from '@/content/family-language';
