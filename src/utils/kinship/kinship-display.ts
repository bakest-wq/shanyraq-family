import type { KinshipExplanation, KinshipResult, KinshipType } from '@/utils/kinship/types';
import { UNKNOWN_KINSHIP } from '@/utils/kinship/labels.kz';

/** Short labels for cards and badges — engine keeps richer metadata internally. */
const KINSHIP_MAIN_LABELS: Partial<Record<KinshipType, string>> = {
  grandfather: 'Ата',
  grandmother: 'Әже',
  paternal_aga: 'Аға',
  paternal_ini: 'Іні',
  paternal_apke: 'Әпке',
  paternal_singli: 'Қарындас',
  paternal_neutral: 'Туыс',
  nagashy_neutral: 'Нағашы',
  kayin_neutral: 'Қайын туыс',
  kayin_jurt: 'Қайын жұрт',
  sibling_neutral: 'Бауыр',
  relative_neutral: 'Туыс',
  kuda_neutral: 'Құдалық байланыс',
  spouse: 'Жұбай',
};

export function formatKinshipMainLabel(result: KinshipResult): string {
  if (result.type === 'unknown' || result.resolved === false) {
    return UNKNOWN_KINSHIP.kazakh;
  }

  const label = KINSHIP_MAIN_LABELS[result.type] ?? result.label.kazakh;
  return label;
}

export function formatKinshipDetailSummary(explanation: KinshipExplanation): string {
  return explanation.summary.trim();
}
