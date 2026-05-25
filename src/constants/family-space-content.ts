import { bilingual, FAMILY_LANGUAGE, kk } from '@/content/family-language';

export const FAMILY_SPACE_COPY = {
  memberReadOnlyHint: kk(FAMILY_LANGUAGE.familySpace.memberReadOnly),
  ownerCanEditHint: kk(FAMILY_LANGUAGE.familySpace.ownerCanEdit),
  suggestEditInstead: bilingual(FAMILY_LANGUAGE.familySpace.suggestEdit),
  suggestDeleteInstead: bilingual(FAMILY_LANGUAGE.familySpace.suggestDelete),
  joinIdentityTitle: kk(FAMILY_LANGUAGE.familySpace.joinIdentityTitle),
  joinIdentitySubtitle: kk(FAMILY_LANGUAGE.familySpace.joinIdentitySubtitle),
  joinExistingOption: kk(FAMILY_LANGUAGE.identity.existingOption),
  joinAddSelfOption: kk(FAMILY_LANGUAGE.identity.addOption),
  joinContinue: bilingual({ kk: 'Қосылу', ru: 'Продолжить' }),
  joinNeedIdentity: kk(FAMILY_LANGUAGE.familySpace.joinNeedIdentity),
} as const;

export { FAMILY_LANGUAGE, bilingual, kk } from '@/content/family-language';
