import type { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { classifyKinship } from '@/utils/kinship/classify';
import { GENDER_HINT_KZ, UNKNOWN_KINSHIP } from '@/utils/kinship/labels.kz';
import {
  childRoleWord,
  siblingPossessivePhrase,
  siblingRoleLabel,
} from '@/utils/kinship/possessive.kz';
import { findKinshipPath } from '@/utils/kinship/path';
import type { KinshipExplanation, KinshipResult } from '@/utils/kinship/types';

function stepName(step: KinshipResult['pathSteps'][number] | undefined): string {
  return step ? getRelativeDisplayName(step.person) : 'Бұл тұлға';
}

function stepLabel(step: KinshipResult['pathSteps'][number] | undefined, fallback: string): string {
  return step?.stepLabel ?? fallback;
}

function buildConclusion(result: KinshipResult, rootName: string): string {
  const targetName =
    result.pathSteps.length > 0
      ? getRelativeDisplayName(result.pathSteps.at(-1)!.person)
      : 'Бұл тұлға';
  const first = result.pathSteps[0];
  const second = result.pathSteps[1];

  switch (result.type) {
    case 'self':
      return 'Бұл сіз таңдаған орталық тұлға.';
    case 'father':
      return `${targetName} — ${rootName} үшін әке.`;
    case 'mother':
      return `${targetName} — ${rootName} үшін ана.`;
    case 'son':
      return `${targetName} — ${rootName} үшін ұл.`;
    case 'daughter':
      return `${targetName} — ${rootName} үшін қыз.`;
    case 'husband':
      return `${targetName} — ${rootName} үшін күйеуі.`;
    case 'wife':
      return `${targetName} — ${rootName} үшін әйелі.`;
    case 'spouse':
      return `${targetName} — ${rootName} үшін жұбайы.`;
    case 'aga':
    case 'ini':
    case 'apke':
    case 'singli':
    case 'sibling_neutral':
      return `${targetName} — ${rootName} үшін ${result.label.kazakh.toLowerCase()}.`;
    case 'grandfather':
      return `${targetName} — ${rootName} үшін ата (әke жағы).`;
    case 'grandmother':
      return `${targetName} — ${rootName} үшін әже (әke жағы).`;
    case 'nemere':
      return `${targetName} — ${rootName} үшін немере.`;
    case 'shobere':
      return `${targetName} — ${rootName} үшін шөбере.`;
    case 'jenge': {
      const siblingName = stepName(first);
      const siblingRole = stepLabel(first, siblingRoleLabel('aga'));
      return `${targetName} — ${siblingPossessivePhrase(siblingRole, siblingName)} жұбайы. Сізге жеңге болады.`;
    }
    case 'jezde': {
      const siblingName = stepName(first);
      const siblingRole = stepLabel(first, siblingRoleLabel('apke'));
      return `${targetName} — ${siblingPossessivePhrase(siblingRole, siblingName)} жұбайы. Сізге жезде болады.`;
    }
    case 'kelin':
      return `${targetName} — ${stepName(first)} ${stepLabel(first, 'ұлы')}ыңыздың жұбайы. Сізге келін болады.`;
    case 'kuyeu_bala':
      return `${targetName} — ${stepName(first)} ${stepLabel(first, 'қызы')}ыңыздың жұбайы. Сізге күйеу бала болады.`;
    case 'kayin_ata':
      return `${targetName} — жұбайыңыздың әкесі. Сізге қайын ата болады.`;
    case 'kayin_ene':
      return `${targetName} — жұбайыңыздың анасы. Сізге қайын ене болады.`;
    case 'kayin_aga':
    case 'kayin_ini':
    case 'kayin_apke':
    case 'kayin_singli':
    case 'kayin_neutral':
      return `${targetName} — жұбайыңыздың ${result.label.kazakh.toLowerCase()}.`;
    case 'abysyn':
      return `${targetName} — жұбайыңыздың аға/інісінің жұбайы. Сізге абысын болады.`;
    case 'kayin_jezde':
      return `${targetName} — жұбайыңыздың әпке/сіңлідің жұбайы. Сізге қайын жезде болады.`;
    case 'kayin_jurt':
      return `${targetName} — жұбайыңыз жағынан туыс. Сізге қайын жұрт болады.`;
    case 'nagashy_ata':
      return `${targetName} — анаңыздың әкесі. Сізге нағашы ата болады.`;
    case 'nagashy_aje':
      return `${targetName} — анаңыздың анасы. Сізге нағашы әже болады.`;
    case 'nagashy_aga':
    case 'nagashy_ini':
    case 'nagashy_apke':
    case 'nagashy_singli':
    case 'nagashy_neutral':
      return `${targetName} — анаңыздың ${result.label.kazakh.toLowerCase()}. Сізге ${result.label.kazakh.toLowerCase()} болады.`;
    case 'paternal_aga':
    case 'paternal_ini':
    case 'paternal_apke':
    case 'paternal_singli':
    case 'paternal_neutral':
      return `${targetName} — ${result.label.kazakh}. Сізге ${result.label.kazakh.toLowerCase()} болады.`;
    case 'zhien': {
      const siblingRole = stepLabel(first, siblingRoleLabel('apke'));
      const childWord = childRoleWord(result.pathSteps.at(-1)?.person.gender);
      return `${targetName} — ${siblingPossessivePhrase(siblingRole)} ${childWord}. Сізге жиен болады.`;
    }
    case 'bole':
      if (second?.stepLabel.includes('апалы')) {
        return `${targetName} — ${rootName} екеуіңіздің аналарыңыз апалы-сіңлі. Сондықтан бөле боласыздар.`;
      }

      return `${targetName} — анаңыздың ${stepLabel(second, 'туыс')} баласы. Сізге бөле болады. Аналары апалы-сіңлі болғандықтан бөле.`;
    case 'kuda':
      return `${targetName} — балаңыздың жұбайының әкесі. Сізге құда болады.`;
    case 'kudagi':
      return `${targetName} — балаңыздың жұбайының анасы. Сізге құдағи болады.`;
    case 'kuda_neutral':
      return `${targetName} — балаңыздың жұбайы жағынан туыс. Құдалық байланыс ретінде көрсетіледі.`;
    case 'relative_neutral':
      return `${targetName} — ${rootName} үшін туыс, бірақ жыныс нақтыланбаған.`;
    case 'unknown':
      return UNKNOWN_KINSHIP.kazakh;
    default:
      if (result.resolved) {
        return `${targetName} — ${rootName} үшін «${result.label.kazakh}» ретінде анықталады.`;
      }

      return UNKNOWN_KINSHIP.kazakh;
  }
}

export function explainKinship(
  rootPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipExplanation {
  const result = classifyKinship(rootPerson, targetPerson, allRelatives);
  const rootName = getRelativeDisplayName(rootPerson);
  const pathSteps = findKinshipPath(rootPerson, targetPerson, allRelatives);
  const mergedResult = {
    ...result,
    pathSteps: pathSteps.length > 0 ? pathSteps : result.pathSteps,
  };

  const pathText =
    mergedResult.pathSteps.length > 0
      ? mergedResult.pathSteps
          .map((step) => `${getRelativeDisplayName(step.person)} — ${step.stepLabel}`)
          .join(' → ')
      : describeKinshipPathFallback(rootPerson, targetPerson, mergedResult);

  const summary = buildConclusion(mergedResult, rootName);
  const hints = [
    mergedResult.missingGenderHint ? GENDER_HINT_KZ : null,
    mergedResult.confidenceHint ?? null,
  ].filter(Boolean);

  return {
    title: mergedResult.uncertain
      ? `${mergedResult.label.kazakh} (мүмкін)`
      : mergedResult.label.kazakh,
    summary,
    pathText,
    hint: hints.length > 0 ? hints.join(' ') : undefined,
    result: mergedResult,
  };
}

function describeKinshipPathFallback(
  rootPerson: Relative,
  targetPerson: Relative,
  result: KinshipResult,
): string {
  if (result.type === 'self') {
    return `${getRelativeDisplayName(targetPerson)} — орталық тұлға`;
  }

  return `${getRelativeDisplayName(rootPerson)} → ${getRelativeDisplayName(targetPerson)}`;
}

export function explainKinshipToMe(
  anchorPerson: Relative,
  targetPerson: Relative,
  allRelatives: Relative[],
): KinshipExplanation {
  const explanation = explainKinship(anchorPerson, targetPerson, allRelatives);

  return {
    ...explanation,
    summary: explanation.summary
      .replace(getRelativeDisplayName(anchorPerson), 'Сіз')
      .replace(/Сіз үшін/g, 'Сізге')
      .replace(/Сіздің/g, 'Сіздің'),
  };
}
