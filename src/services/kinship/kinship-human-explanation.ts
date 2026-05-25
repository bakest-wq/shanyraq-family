import { formatKinshipMainLabel } from '@/utils/kinship/kinship-display';
import { UNKNOWN_KINSHIP } from '@/utils/kinship/labels.kz';
import {
  childRoleWord,
  siblingPossessivePhrase,
  siblingRoleLabel,
} from '@/utils/kinship/possessive.kz';
import type { KinshipResult, KinshipType } from '@/services/kinship/types';
import { getRelativeDisplayName } from '@/utils/relative-names';

const THIS_PERSON = 'Бұл адам';

type HumanExplanationDraft = {
  relation: string;
  role?: string;
};

function ensureSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return trimmed;
  }

  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
}

function composeExplanation(draft: HumanExplanationDraft): string {
  const relation = ensureSentence(draft.relation);

  if (!draft.role) {
    return relation;
  }

  return `${relation} ${ensureSentence(draft.role)}`;
}

function roleToYou(label: string): string {
  return `Сізге ${label.trim().toLowerCase()} болады`;
}

function thisPerson(relationPath: string): string {
  return `${THIS_PERSON} ${relationPath.trim()}`;
}

function stepLabel(step: KinshipResult['pathSteps'][number] | undefined, fallback: string): string {
  return step?.stepLabel ?? fallback;
}

function isSiblingPathStep(step: KinshipResult['pathSteps'][number] | undefined): boolean {
  if (!step) {
    return false;
  }

  return (
    /аға|іні|әпке|сіңлі|бауыр|қарындас/i.test(step.stepLabel) &&
    !/ұлы|қызы|бала/i.test(step.stepLabel)
  );
}

function childPossessivePhrase(step: KinshipResult['pathSteps'][number] | undefined): string {
  const role = stepLabel(step, 'бала');

  if (/ұлы/i.test(role)) {
    return 'ұлыңыздың';
  }

  if (/қызы/i.test(role)) {
    return 'қызыңыздың';
  }

  return 'балаңыздың';
}

function displayRoleLabel(result: KinshipResult): string {
  return formatKinshipMainLabel(result).toLowerCase();
}

const SIBLING_POSSESSIVE_BEFORE_NAME: Record<string, string> = {
  аға: 'ағаңыз',
  іні: 'ініңіз',
  әпке: 'әпкеңіз',
  сіңлі: 'сіңліңіз',
  қарындас: 'қарындасыңыз',
  бауыр: 'бауырыңыз',
};

function siblingPossessiveBeforeName(stepLabelText: string): string {
  const normalized = stepLabelText.trim().toLowerCase();
  return SIBLING_POSSESSIVE_BEFORE_NAME[normalized]
    ?? siblingPossessivePhrase(stepLabelText).replace(/дың$/, '');
}

function buildBrotherChildRelation(result: KinshipResult, targetName: string): string {
  const first = result.pathSteps[0];
  const siblingStep = stepLabel(first, 'бауыр');
  const brotherName = getRelativeDisplayName(first.person);

  return `${targetName} — ${siblingPossessiveBeforeName(siblingStep)} ${brotherName}ның баласы`;
}

function buildBrotherWifeRelation(result: KinshipResult, targetName: string): string {
  const first = result.pathSteps[0];
  const siblingStep = stepLabel(first, 'бауыр');
  const brotherName = getRelativeDisplayName(first.person);

  return `${targetName} — ${siblingPossessiveBeforeName(siblingStep)} ${brotherName}ның жұбайы`;
}

function ownedSiblingForm(stepLabelText: string): string {
  const normalized = stepLabelText.trim().toLowerCase();
  const map: Record<string, string> = {
    аға: 'ағасы',
    іні: 'інісі',
    әпке: 'әпкесі',
    қарындас: 'сіңlisі',
    сіңлі: 'сіңlisі',
    бауыр: 'бауыры',
  };

  return map[normalized] ?? normalized;
}

function siblingPathWord(type: KinshipType): string {
  const extendedMatch = type.match(/^(?:nagashy|kayin|paternal)_(aga|ini|apke|singli|neutral)$/);
  const baseType = (extendedMatch?.[1] ?? type) as KinshipType;

  return ownedSiblingForm(siblingRoleLabel(baseType));
}

function buildDirectToMe(result: KinshipResult): string {
  const role = displayRoleLabel(result);

  switch (result.type) {
    case 'self':
      return 'Бұл сіз таңдаған орталық тұлға.';
    case 'father':
      return composeExplanation({ relation: thisPerson('сіздің әкеңіз') });
    case 'mother':
      return composeExplanation({ relation: thisPerson('сіздің анаңыз') });
    case 'son':
      return composeExplanation({ relation: thisPerson('сіздің ұлыңыз') });
    case 'daughter':
      return composeExplanation({ relation: thisPerson('сіздің қызыңыз') });
    case 'husband':
      return composeExplanation({ relation: thisPerson('сіздің күйеуіңіз') });
    case 'wife':
      return composeExplanation({ relation: thisPerson('сіздің әйеліңіз') });
    case 'spouse':
      return composeExplanation({ relation: thisPerson('сіздің жұбайыңыз') });
    case 'aga':
    case 'ini':
    case 'apke':
    case 'singli':
    case 'sibling_neutral':
      return composeExplanation({ relation: thisPerson(`сіздің ${role}ңыз`) });
    case 'nemere':
      return composeExplanation({ relation: thisPerson('сіздің немереңіз') });
    case 'shobere':
      return composeExplanation({ relation: thisPerson('сіздің шөбереңіз') });
    default:
      return composeExplanation({ relation: thisPerson(`сіздің ${role}ңыз`) });
  }
}

function buildIndirectToMe(result: KinshipResult): string {
  const role = displayRoleLabel(result);
  const first = result.pathSteps[0];
  const second = result.pathSteps[1];
  const siblingRole = stepLabel(first, siblingRoleLabel('aga'));
  const childWord = childRoleWord(result.pathSteps.at(-1)?.person.gender);

  switch (result.type) {
    case 'grandfather':
      return composeExplanation({
        relation: thisPerson('әкеңіздің әкесі'),
        role: roleToYou('ата'),
      });
    case 'grandmother':
      return composeExplanation({
        relation: thisPerson('әкеңіздің анасы'),
        role: roleToYou('әже'),
      });
    case 'kayin_ata':
      return composeExplanation({
        relation: thisPerson('жұбайыңыздың әкесі'),
        role: roleToYou('қайын ата'),
      });
    case 'kayin_ene':
      return composeExplanation({
        relation: thisPerson('жұбайыңыздың анасы'),
        role: roleToYou('қайын ене'),
      });
    case 'kayin_aga':
    case 'kayin_ini':
    case 'kayin_apke':
    case 'kayin_singli':
    case 'kayin_neutral':
      return composeExplanation({
        relation: thisPerson(`жұбайыңыздың ${siblingPathWord(result.type)}`),
        role: roleToYou(role),
      });
    case 'nagashy_ata':
      return composeExplanation({
        relation: thisPerson('анаңыздың әкесі'),
        role: roleToYou('нағашы ата'),
      });
    case 'nagashy_aje':
      return composeExplanation({
        relation: thisPerson('анаңыздың анасы'),
        role: roleToYou('нағашы әже'),
      });
    case 'nagashy_aga':
    case 'nagashy_ini':
    case 'nagashy_apke':
    case 'nagashy_singli':
    case 'nagashy_neutral':
      return composeExplanation({
        relation: thisPerson(`анаңыздың ${siblingPathWord(result.type)}`),
        role: roleToYou(role),
      });
    case 'paternal_aga':
    case 'paternal_ini':
    case 'paternal_apke':
    case 'paternal_singli':
    case 'paternal_neutral':
      return composeExplanation({
        relation: thisPerson(`әкеңіздің ${siblingPathWord(result.type)}`),
        role: roleToYou(role),
      });
    case 'jenge':
      if (isSiblingPathStep(first)) {
        return composeExplanation({
          relation: buildBrotherWifeRelation(result, getRelativeDisplayName(result.pathSteps.at(-1)!.person)),
          role: roleToYou('жеңге'),
        });
      }

      return composeExplanation({
        relation: thisPerson(`${siblingPossessivePhrase(siblingRole)} жұбайы`),
        role: roleToYou('жеңге'),
      });
    case 'brother_wife_neutral':
      return composeExplanation({
        relation: buildBrotherWifeRelation(result, getRelativeDisplayName(result.pathSteps.at(-1)!.person)),
        role: roleToYou('туыс'),
      });
    case 'jezde':
      return composeExplanation({
        relation: thisPerson(`${siblingPossessivePhrase(stepLabel(first, siblingRoleLabel('apke')))} жұбайы`),
        role: roleToYou('жезде'),
      });
    case 'kelin':
      if (isSiblingPathStep(first)) {
        return composeExplanation({
          relation: buildBrotherWifeRelation(result, getRelativeDisplayName(result.pathSteps.at(-1)!.person)),
          role: roleToYou('келін'),
        });
      }

      return composeExplanation({
        relation: thisPerson(`${childPossessivePhrase(first)} жұбайы`),
        role: roleToYou('келін'),
      });
    case 'kuyeu_bala':
      return composeExplanation({
        relation: thisPerson(`${childPossessivePhrase(first)} жұбайы`),
        role: roleToYou('күйеу бала'),
      });
    case 'brother_child_older':
    case 'brother_child_younger':
    case 'brother_child_neutral':
      return buildBrotherChildRelation(result, getRelativeDisplayName(result.pathSteps.at(-1)!.person));
    case 'zhien':
      if (first && /қызы/i.test(stepLabel(first, ''))) {
        return composeExplanation({
          relation: thisPerson(`${childPossessivePhrase(first)} ${childWord}`),
          role: roleToYou('жиен'),
        });
      }

      return composeExplanation({
        relation: thisPerson(`${siblingPossessivePhrase(stepLabel(first, siblingRoleLabel('apke')))} ${childWord}`),
        role: roleToYou('жиен'),
      });
    case 'bole':
      if (second?.stepLabel.includes('апалы')) {
        return composeExplanation({
          relation: thisPerson('аналарыңыз апалы-сіңлі'),
          role: roleToYou('бөле'),
        });
      }

      return composeExplanation({
        relation: thisPerson(`анаңыздың ${stepLabel(second, 'туыс')} баласы`),
        role: roleToYou('бөле'),
      });
    case 'kuda':
      if (isSiblingPathStep(first) || result.pathSteps.some(isSiblingPathStep)) {
        return composeExplanation({
          relation: thisPerson('бауырыңыздың жұбайының әкесі'),
          role: roleToYou('құда'),
        });
      }

      return composeExplanation({
        relation: thisPerson(`${childPossessivePhrase(first)} жұбайының әкесі`),
        role: roleToYou('құда'),
      });
    case 'kudagi':
      if (isSiblingPathStep(first) || result.pathSteps.some(isSiblingPathStep)) {
        return composeExplanation({
          relation: thisPerson('бауырыңыздың жұбайының анасы'),
          role: roleToYou('құдағи'),
        });
      }

      return composeExplanation({
        relation: thisPerson(`${childPossessivePhrase(first)} жұбайының анасы`),
        role: roleToYou('құдағи'),
      });
    case 'abysyn':
      return composeExplanation({
        relation: thisPerson('жұбайыңыздың аға немесе інісінің жұбайы'),
        role: roleToYou('абысын'),
      });
    case 'kayin_jezde':
      return composeExplanation({
        relation: thisPerson('жұбайыңыздың әпке немесе сіңлінің жұбайы'),
        role: roleToYou('қайын жезде'),
      });
    case 'kayin_jurt':
      return composeExplanation({
        relation: thisPerson('жұбайыңыз жағынан туыс'),
        role: roleToYou('қайын жұрт'),
      });
    case 'kuda_neutral':
      return 'Бұл адам сізбен құдалық байланыста. Нақты атау әлі анық емес.';
    case 'relative_neutral':
      return 'Бұл адам туыс, бірақ нақты атау жыныс көрсетілгеннен кейін анықталады.';
    case 'unknown':
      return result.confidenceHint ?? UNKNOWN_KINSHIP.kazakh;
    default:
      if (result.resolved) {
        return composeExplanation({
          relation: thisPerson(`сіздің ${role}ңыз`),
        });
      }

      return result.confidenceHint ?? UNKNOWN_KINSHIP.kazakh;
  }
}

function buildThirdPerson(result: KinshipResult, rootName: string): string {
  const targetName =
    result.pathSteps.length > 0
      ? getRelativeDisplayName(result.pathSteps.at(-1)!.person)
      : THIS_PERSON;
  const role = displayRoleLabel(result);

  switch (result.type) {
    case 'self':
      return `${targetName} — ${rootName} таңдаған орталық тұлға.`;
    case 'father':
      return `${targetName} — ${rootName} үшін әке.`;
    case 'mother':
      return `${targetName} — ${rootName} үшін ана.`;
    case 'kayin_ata':
      return `${targetName} — ${rootName} жұбайының әкесі. ${rootName} үшін қайын ата.`;
    case 'nagashy_aga':
    case 'nagashy_ini':
    case 'nagashy_apke':
    case 'nagashy_singli':
    case 'nagashy_neutral':
      return `${targetName} — ${rootName} анасының ${siblingPathWord(result.type)}. ${rootName} үшін ${role}.`;
    case 'kuda':
      return `${targetName} — ${rootName} туыс жанұясымен құдалық байланыста. ${rootName} үшін құда.`;
    case 'jenge':
    case 'kelin':
      if (result.pathSteps[0] && isSiblingPathStep(result.pathSteps[0])) {
        return `${buildBrotherWifeRelation(result, targetName)}. ${rootName} үшін ${role}.`;
      }

      if (result.type === 'kelin') {
        return `${targetName} — ${rootName} ұлының жұбайы. ${rootName} үшін келін.`;
      }

      return `${targetName} — ${rootName} үшін ${role}.`;
    case 'brother_wife_neutral':
      return `${buildBrotherWifeRelation(result, targetName)}. ${rootName} үшін ${role}.`;
    case 'brother_child_older':
    case 'brother_child_younger':
    case 'brother_child_neutral':
      return `${buildBrotherChildRelation(result, targetName)}. ${rootName} үшін ${role}.`;
    case 'unknown':
      return result.confidenceHint ?? UNKNOWN_KINSHIP.kazakh;
    default:
      if (result.resolved) {
        return `${targetName} — ${rootName} үшін ${role}.`;
      }

      return result.confidenceHint ?? UNKNOWN_KINSHIP.kazakh;
  }
}

const DIRECT_TO_ME_TYPES = new Set<KinshipType>([
  'self',
  'father',
  'mother',
  'son',
  'daughter',
  'husband',
  'wife',
  'spouse',
  'aga',
  'ini',
  'apke',
  'singli',
  'sibling_neutral',
  'nemere',
  'shobere',
]);

/** Plain Kazakh explanation — calm, short, no graph jargon. */
export function buildHumanKinshipExplanation(result: KinshipResult, toMe: boolean, rootName = ''): string {
  if (!toMe) {
    return buildThirdPerson(result, rootName);
  }

  if (DIRECT_TO_ME_TYPES.has(result.type)) {
    return buildDirectToMe(result);
  }

  return buildIndirectToMe(result);
}
