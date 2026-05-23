import type { RelativeGender } from '@/types/relative';

export function childPossessiveRoleLabel(gender?: RelativeGender): { kz: string; ru: string } {
  if (gender === 'female') {
    return { kz: 'қызы', ru: 'дочь' };
  }

  return { kz: 'ұлы', ru: 'сын' };
}

export function parentRoleLabel(
  role: 'father' | 'mother',
): { kz: string; ru: string } {
  if (role === 'mother') {
    return { kz: 'анасы', ru: 'мать' };
  }

  return { kz: 'әкesi', ru: 'отец' };
}

export function buildChildToParentMessage(
  childName: string,
  parentName: string,
  gender?: RelativeGender,
): { kz: string; ru: string } {
  const role = childPossessiveRoleLabel(gender);

  return {
    kz: `${childName} — ${parentName}ның ${role.kz} болуы мүмкін`,
    ru: `${childName} может быть ${role.ru} ${parentName}`,
  };
}

export function buildMissingParentMessage(
  childName: string,
  parentName: string,
  role: 'father' | 'mother',
): { kz: string; ru: string } {
  const label = parentRoleLabel(role);

  return {
    kz: `${childName} үшін ${parentName} ${label.kz} ретінде қосылуы мүмкін`,
    ru: `Для ${childName} можно указать ${parentName} как ${label.ru}`,
  };
}

export function buildSpouseLinkMessage(
  personAName: string,
  personBName: string,
): { kz: string; ru: string } {
  return {
    kz: `${personAName} мен ${personBName} жұбай болуы мүмкін`,
    ru: `${personAName} и ${personBName} могут быть супругами`,
  };
}

export function buildCoParentSpouseMessage(
  personAName: string,
  personBName: string,
): { kz: string; ru: string } {
  return {
    kz: `${personAName} мен ${personBName} — ортақ балалардың ата-анасы. Жұбай байланысын қосу ұсынылады`,
    ru: `${personAName} и ${personBName} — родители одних детей. Рекомендуем связать как супругов`,
  };
}

export function buildSiblingNoteMessage(
  personAName: string,
  personBName: string,
): { kz: string; ru: string } {
  return {
    kz: `${personAName} мен ${personBName} — бауырлар (ортақ ата-ана)`,
    ru: `${personAName} и ${personBName} — братья/сёстры (общие родители)`,
  };
}
