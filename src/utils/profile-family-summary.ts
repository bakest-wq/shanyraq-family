import type { Relative } from '@/types/relative';
import { getKinshipLabel, getThreeJurtGroup } from '@/services/kinship.service';
import { resolveFamilyRing } from '@/services/family-graph.service';
import { SHEZHIRE_JURT } from '@/constants/family-ux-content';
import { getRelativeDisplayName } from '@/utils/relative-names';
import type { KinshipType } from '@/utils/kinship/types';

function firstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return name;
  }

  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function possessivePhrase(anchorName: string, kinshipType: KinshipType): string | null {
  const base = firstName(anchorName);

  const map: Partial<Record<KinshipType, string>> = {
    father: `${base}ның әкесі`,
    mother: `${base}ның анасы`,
    son: `${base}ның ұлы`,
    daughter: `${base}ның қызы`,
    husband: `${base}ның күйеуі`,
    wife: `${base}ның әйелі`,
    spouse: `${base}ның жұбайы`,
    grandfather: `${base}ның атасы`,
    grandmother: `${base}ның әжесі`,
    aga: `${base}ның ағасы`,
    ini: `${base}ның інісі`,
    apke: `${base}ның әпкесі`,
    singli: `${base}ның сіңлісі`,
    sibling_neutral: `${base}ның бауыры`,
    nemere: `${base}ның немересі`,
    nagashy_ata: `${base}ның нағашы атасы`,
    nagashy_aje: `${base}ның нағашы әжесі`,
    kayin_ata: `${base}ның қайын атасы`,
    kayin_ene: `${base}ның қайын енесі`,
  };

  return map[kinshipType] ?? null;
}

/** Warm, structurally valid one-line family summaries for a profile. */
export function buildProfileFamilySummaries(
  person: Relative,
  relatives: Relative[],
  anchorPerson: Relative | null,
): string[] {
  const summaries: string[] = [];
  const ring = resolveFamilyRing(person, relatives);

  if (anchorPerson && anchorPerson.id !== person.id) {
    const kinship = getKinshipLabel(anchorPerson, person, relatives);
    if (kinship.resolved && kinship.type !== 'unknown' && kinship.type !== 'self') {
      const phrase = possessivePhrase(getRelativeDisplayName(anchorPerson), kinship.type);
      if (phrase) {
        summaries.push(phrase);
      }
    }

    const jurtGroup = getThreeJurtGroup(anchorPerson, person, relatives);
    if (jurtGroup === 'nagashy_jurt') {
      summaries.push(SHEZHIRE_JURT.profileJurtSummaries.nagashy);
    } else if (jurtGroup === 'kaiyn_jurt') {
      summaries.push(SHEZHIRE_JURT.profileJurtSummaries.kayin);
    } else if (jurtGroup === 'kuda_jurt') {
      summaries.push(SHEZHIRE_JURT.profileJurtSummaries.kuda);
    }
  }

  if (ring.children.length > 0) {
    const count = ring.children.length;
    if (person.gender === 'male') {
      summaries.push(`${count} баланың атасы`);
    } else if (person.gender === 'female') {
      summaries.push(`${count} баланың анасы`);
    } else {
      summaries.push(`${count} бала`);
    }
  }

  return [...new Set(summaries)].slice(0, 2);
}

export function isUnknownKinshipLabel(label: string | null | undefined): boolean {
  if (!label) {
    return true;
  }

  const normalized = label.trim().toLowerCase();
  return (
    normalized.includes('анықталмады') ||
    normalized.includes('не определена')
  );
}
