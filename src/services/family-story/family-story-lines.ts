import { FAMILY_STORY_FOR_CHILDREN } from '@/constants/family-story-content';
import type { FamilyStoryContext } from '@/services/family-story/family-story.types';
import type { KinshipResult, KinshipType } from '@/services/kinship/types';

function ensureSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return trimmed;
  }

  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
}

function viaGrandparentFromPath(result: KinshipResult): boolean {
  if (result.pathSteps.length < 3) {
    return false;
  }

  return result.pathSteps.some((step) => /^(ата|әже)\b/i.test(step.stepLabel.trim()));
}

export function resolveFamilyStoryContext(result: KinshipResult): FamilyStoryContext {
  const target = result.pathSteps.at(-1)?.person;

  return {
    viaGrandparent: viaGrandparentFromPath(result),
    targetDeceased: Boolean(target?.isDeceased),
  };
}

type StoryBuilder = (context: FamilyStoryContext) => string | null;

const STORY_FROM_ROOT: Partial<Record<KinshipType, StoryBuilder>> = {
  father: () => 'Бұл кісі сіздің әкеңіз',
  mother: () => 'Бұл кісі сіздің анаңыз',
  son: () => 'Бұл кісі сіздің ұлыңыз',
  daughter: () => 'Бұл кісі сіздің қызыңыз',
  husband: () => 'Бұл кісі сіздің күйеуіңіз',
  wife: () => 'Бұл кісі сіздің әйеліңіз',
  spouse: () => 'Бұл кісі сіздің жұбайыңыз',
  aga: () => 'Бұл кісі сіздің ағаңыз',
  ini: () => 'Бұл кісі сіздің ініңіз',
  apke: () => 'Бұл кісі сіздің апкеңіз',
  singli: () => 'Бұл кісі сіздің сіңліңіз',
  sibling_neutral: () => 'Бұл кісі сіздің бауырыңыз',
  grandfather: () => 'Бұл кісі сіздің атаңыз',
  grandmother: () => 'Бұл кісі сіздің әжеңіз',
  nemere: () => 'Бұл кісі сіздің немереңіз',
  shobere: () => 'Бұл кісі сіздің шөбереңіз',
  nagashy_ata: () => 'Бұл кісі сіздің анаңыздың әкесі',
  nagashy_aje: () => 'Бұл кісі сіздің анаңыздың анасы',
  nagashy_aga: () => 'Бұл кісі сіздің анаңыздың туған ағасы',
  nagashy_ini: () => 'Бұл кісі сіздің анаңыздың туған інісі',
  nagashy_apke: () => 'Бұл кісі сіздің анаңыздың туған әпкесі',
  nagashy_singli: () => 'Бұл кісі сіздің анаңыздың туған сіңлісі',
  nagashy_neutral: () => 'Бұл кісі анаңыз жағыndan туыс',
  paternal_aga: (context) =>
    context.viaGrandparent
      ? 'Бұл кісі сіздің атаңыздың туған ағасы'
      : 'Бұл кісі сіздің әкеңіздің туған ағасы',
  paternal_ini: (context) =>
    context.viaGrandparent
      ? 'Бұл кісі сіздің атаңыздың туған інісі'
      : 'Бұл кісі сіздің әкеңіздің туған інісі',
  paternal_apke: (context) =>
    context.viaGrandparent
      ? 'Бұл кісі сіздің атаңыздың туған әпкесі'
      : 'Бұл кісі сіздің әкеңіздің туған әпкесі',
  paternal_singli: (context) =>
    context.viaGrandparent
      ? 'Бұл кісі сіздің атаңыздың туған сіңлісі'
      : 'Бұл кісі сіздің әкеңіздің туған сіңлісі',
  paternal_neutral: (context) =>
    context.viaGrandparent
      ? 'Бұл кісі сіздің атаңыз жағыndan туыс'
      : 'Бұл кісі сіздің әкеңіз жағыndan туыс',
  kayin_ata: () => 'Бұл кісі сіздің жұбайыңыздың әкесі',
  kayin_ene: () => 'Бұл кісі сіздің жұбайыңыздың анасы',
  kayin_aga: () => 'Бұл кісі сіздің жұбайыңыздың туған ағасы',
  kayin_ini: () => 'Бұл кісі сіздің жұбайыңыздың туған інісі',
  kayin_apke: () => 'Бұл кісі сіздің жұбайыңыздың туған әпкесі',
  kayin_singli: () => 'Бұл кісі сіздің жұбайыңыздың туған сіңлісі',
  kayin_neutral: () => 'Бұл кісі жұбайыңыз жағыndan туыс',
  jenge: () => 'Бұл кісі сіздің аға немесе ініңіздің жұбайы',
  jezde: () => 'Бұл кісі сіздің апке немесе сіңліңіздің жұбайы',
  kelin: () => 'Бұл кісі сіздің балаңыздың жұбайы',
  kuyeu_bala: () => 'Бұл кісі сіздің балаңыздың жұбайы',
  zhien: () => 'Бұл кісі сіздің апке немесе сіңліңіздің баласы',
  bole: () => 'Бұл кісі анаңыз жағыndan жақын туыс',
  kuda: () => 'Бұл кісі сіздің отбасыңызбен құдалық байланыста',
  kudagi: () => 'Бұл кісі сіздің отбасыңызбен құдалық байланыста',
  abysyn: () => 'Бұл кісі сіздің абысын',
  kayin_jezde: () => 'Бұл кісі сіздің қайын жездеңіз',
};

export function buildFamilyStoryLineFromRoot(
  result: KinshipResult,
  context: FamilyStoryContext,
): string | null {
  if (!result.resolved || result.type === 'unknown' || result.type === 'self') {
    return null;
  }

  const builder = STORY_FROM_ROOT[result.type];
  if (!builder) {
    return null;
  }

  const line = builder(context);
  return line ? ensureSentence(line) : null;
}

export function buildFamilyStoryLineForChildren(type: KinshipType): string | null {
  const template = FAMILY_STORY_FOR_CHILDREN[type];
  return template ? ensureSentence(template) : null;
}
