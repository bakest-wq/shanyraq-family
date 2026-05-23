import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  getChildren,
  getEffectiveSpouse,
  getSiblings,
  isFemale,
  isMale,
} from '@/utils/relationship-engine/graph';
import type { RelationshipLabel } from '@/utils/relationship-engine/types';

type PathContext = {
  personA: Relative;
  personB: Relative;
  relatives: Relative[];
};

function siblingRolePhrase(relative: Relative): { kz: string; ru: string } {
  if (isMale(relative)) {
    return { kz: 'ағаңыздың', ru: 'вашего старшего брата' };
  }

  if (isFemale(relative)) {
    return { kz: 'әпкеңіздің', ru: 'вашей сестры' };
  }

  return { kz: 'бауырыңыздың', ru: 'вашего брата/сестры' };
}

function childRolePhrase(relative: Relative): { kz: string; ru: string } {
  if (isFemale(relative)) {
    return { kz: 'қызы', ru: 'дочь' };
  }

  return { kz: 'ұлы', ru: 'сын' };
}

function sentence(personBName: string, kazakhTail: string, russianTail: string): RelationshipLabel {
  return {
    kazakh: `${personBName} — ${kazakhTail}`,
    russian: `${personBName} — ${russianTail}`,
  };
}

export function buildZhienPath(context: PathContext, auntOrUncle: Relative): RelationshipLabel {
  const siblingRole = siblingRolePhrase(auntOrUncle);
  const childRole = childRolePhrase(context.personB);

  return sentence(
    getRelativeDisplayName(context.personB),
    `сіздің ${siblingRole.kz} ${childRole.kz}`,
    `${childRole.ru} ${siblingRole.ru}`,
  );
}

export function buildBolePath(
  context: PathContext,
  parentSide: Relative,
  auntOrUncle: Relative,
): RelationshipLabel {
  const side = parentSide.id === context.personA.motherId ? 'анаңыздың' : 'әкеңіздің';
  const auntRole = isFemale(auntOrUncle) ? 'әпкеңіздің' : 'ағаңыздың';
  const childRole = childRolePhrase(context.personB);

  return sentence(
    getRelativeDisplayName(context.personB),
    `сіздің ${side} ${auntRole} ${childRole.kz}`,
    `бөле — ${childRole.ru} ${isFemale(auntOrUncle) ? 'тёти' : 'дяди'} (${side === 'анаңыздың' ? 'ана жағы' : 'әke жағы'})`,
  );
}

export function buildNagashyPath(context: PathContext): RelationshipLabel {
  return sentence(
    getRelativeDisplayName(context.personB),
    'сіздің анаңыздың ағаңыз',
    'дядя по матери (нағашы)',
  );
}

export function buildNemerePath(context: PathContext): RelationshipLabel {
  for (const child of getChildren(context.personA, context.relatives)) {
    if (
      getChildren(child, context.relatives).some((grandchild) => grandchild.id === context.personB.id)
    ) {
      const childRole = childRolePhrase(child);
      const grandRole = childRolePhrase(context.personB);

      return sentence(
        getRelativeDisplayName(context.personB),
        `сіздің ${childRole.kz}ыңыздың ${grandRole.kz}`,
        `внук/внучка — ${grandRole.ru} ${childRole.ru}`,
      );
    }
  }

  return sentence(
    getRelativeDisplayName(context.personB),
    'сіздің немереңіз',
    'ваш внук / внучка (немере)',
  );
}

export function buildKelinPath(context: PathContext, son: Relative): RelationshipLabel {
  const sonRole = childRolePhrase(son);

  return sentence(
    getRelativeDisplayName(context.personB),
    `сіздің ${sonRole.kz}ыңыздың жұбайы (келін)`,
    'невестка — жена вашего сына',
  );
}

export function buildKuyeuBalaPath(context: PathContext, daughter: Relative): RelationshipLabel {
  const daughterRole = childRolePhrase(daughter);

  return sentence(
    getRelativeDisplayName(context.personB),
    `сіздің ${daughterRole.kz}ыңыздың жұбайы (күйеу бала)`,
    'зять — муж вашей дочери',
  );
}

export function buildKayinJurtPath(context: PathContext): RelationshipLabel {
  const spouse = getEffectiveSpouse(context.personA, context.relatives);
  if (!spouse) {
    return sentence(
      getRelativeDisplayName(context.personB),
      'сіздің қайын жұртыңыз',
      'родня супруга(и)',
    );
  }

  if (context.personB.id === spouse.fatherId) {
    return sentence(
      getRelativeDisplayName(context.personB),
      'сіздің жұбайыңыздың әкesi (қайын жұрт)',
      'отец супруга(и)',
    );
  }

  if (context.personB.id === spouse.motherId) {
    return sentence(
      getRelativeDisplayName(context.personB),
      'сіздің жұбайыңыздың анасы (қайын жұрт)',
      'мать супруга(и)',
    );
  }

  if (getSiblings(spouse, context.relatives).some((sibling) => sibling.id === context.personB.id)) {
    return sentence(
      getRelativeDisplayName(context.personB),
      'сіздің жұбайыңыздың бауыры (қайын жұрт)',
      'брат/сестра супруга(и)',
    );
  }

  return sentence(
    getRelativeDisplayName(context.personB),
    `сіздің жұбайыңыз ${getRelativeDisplayName(spouse)} арқылы туыс (қайын жұрт)`,
    `родственник через супруга(у) ${getRelativeDisplayName(spouse)}`,
  );
}

export function buildCoreRelationshipPath(
  personA: Relative,
  personB: Relative,
  relatives: Relative[],
  type: string,
): RelationshipLabel | undefined {
  const context: PathContext = { personA, personB, relatives };

  if (type === 'father') {
    return sentence(getRelativeDisplayName(personB), 'сіздің Әkeңіз', 'ваш отец');
  }

  if (type === 'mother') {
    return sentence(getRelativeDisplayName(personB), 'сіздің анаңыз', 'ваша мать');
  }

  if (type === 'son' || type === 'daughter') {
    const role = childRolePhrase(personB);
    return sentence(
      getRelativeDisplayName(personB),
      `сіздің ${role.kz}ыңыз`,
      `ваш ${role.ru}`,
    );
  }

  if (type === 'brother' || type === 'sister') {
    const role = siblingRolePhrase(personB);
    return sentence(
      getRelativeDisplayName(personB),
      `сіздің ${role.kz.replace('дың', '')}`,
      `ваш ${isFemale(personB) ? 'брат/сестра' : 'брат'}`,
    );
  }

  if (type === 'grandfather' || type === 'grandmother') {
    return sentence(
      getRelativeDisplayName(personB),
      'сіздің ата-анаңыз',
      'ваш дедушка / бабушка',
    );
  }

  if (type === 'grandson' || type === 'granddaughter' || type === 'nemere') {
    return buildNemerePath(context);
  }

  if (type === 'spouse') {
    return sentence(getRelativeDisplayName(personB), 'сіздің жұбайыңыз', 'ваш супруг(а)');
  }

  return undefined;
}

/*
 * Mock examples for manual testing (no runtime):
 *
 * zhien:
 *   A=Me, B=Erlan, B is child of A's sister Aygul
 *   → label: Жиен · Племянник
 *   → path: «Ерлан — сіздің әпкеңіздің ұлы»
 *
 * bole:
 *   A=Me, B=Daniyar, B is child of A's mother's sister
 *   → label: Бөле · Двоюродный брат (ана жағы)
 *
 * nagashy:
 *   A=Me, B=Nurlan, B is brother of A's mother
 *   → label: Нағашы · Дядя по матери
 *
 * kelin / kuyeu_bala:
 *   A=Me, B=Aigul, B is spouse of A's son Nursultan → Келін
 *   A=Me, B=Timur, B is spouse of A's daughter Madina → Күйеу бала
 */
