import type { RelativeGender } from '@/types/relative';

export type ContextualSuggestionCopy = {
  contextKz: string;
  promptKz: string;
  messageRu: string;
};

export function childPossessiveRoleLabel(gender?: RelativeGender): { kz: string; ru: string } {
  if (gender === 'female') {
    return { kz: 'қызы', ru: 'дочь' };
  }

  return { kz: 'ұлы', ru: 'сын' };
}

export function parentRoleLabel(role: 'father' | 'mother'): {
  kz: string;
  ru: string;
  context: string;
  accusative: string;
} {
  if (role === 'mother') {
    return { kz: 'анасы', ru: 'мать', context: 'Ана байланысы жоқ', accusative: 'ана' };
  }

  return { kz: 'әкesi', ru: 'отец', context: 'Әke байланысы жоқ', accusative: 'әke' };
}

export function buildChildToParentMessage(
  childName: string,
  parentName: string,
  role: 'father' | 'mother',
  gender?: RelativeGender,
): ContextualSuggestionCopy {
  const label = parentRoleLabel(role);
  const childRole = childPossessiveRoleLabel(gender);

  return {
    contextKz: label.context,
    promptKz: `${parentName}ды ${label.accusative} ретінде байланыстыру?`,
    messageRu: `${parentName} как ${label.ru} для ${childName} (${childRole.ru})`,
  };
}

export function buildMissingParentMessage(
  _childName: string,
  parentName: string,
  role: 'father' | 'mother',
): ContextualSuggestionCopy {
  const label = parentRoleLabel(role);

  return {
    contextKz: label.context,
    promptKz: `${parentName}ды ${label.accusative} ретінде байланыстыру?`,
    messageRu: `${parentName} как ${label.ru}`,
  };
}

export function buildSpouseLinkMessage(
  personAName: string,
  personBName: string,
): ContextualSuggestionCopy {
  return {
    contextKz: 'Жұбай байланысы толық емес',
    promptKz: `${personBName} жұбайын қайтару?`,
    messageRu: `Добавить ${personBName} как супруга ${personAName}`,
  };
}

export function buildCoParentSpouseMessage(
  personAName: string,
  personBName: string,
): ContextualSuggestionCopy {
  return {
    contextKz: 'Жұбай байланысы жоқ',
    promptKz: `${personAName} мен ${personBName} жұбайын қосу?`,
    messageRu: `Связать ${personAName} и ${personBName} как супругов`,
  };
}

export function buildSiblingNoteMessage(
  personAName: string,
  personBName: string,
): ContextualSuggestionCopy {
  return {
    contextKz: 'Ортақ ата-ана',
    promptKz: `${personAName} мен ${personBName} — бауырлар`,
    messageRu: `${personAName} и ${personBName} — братья/сёстры`,
  };
}

export function copyToSuggestionFields(copy: ContextualSuggestionCopy) {
  return {
    contextKz: copy.contextKz,
    promptKz: copy.promptKz,
    messageKz: copy.promptKz,
    messageRu: copy.messageRu,
  };
}
