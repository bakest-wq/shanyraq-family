import type { KinshipType } from '@/utils/kinship/types';

export const CHILDHOOD_NOTE_PATTERN =
  /балалық|шағы|бірге\s*тұр|детств|вместе\s*жил|в\s*детств/i;

export const GRANDPARENT_KINSHIP_TYPES = new Set<KinshipType>([
  'grandfather',
  'grandmother',
  'nagashy_ata',
  'nagashy_aje',
  'kayin_ata',
  'kayin_ene',
]);

export const DIRECT_PARENT_KINSHIP_TYPES = new Set<KinshipType>(['father', 'mother']);

export const SPOUSE_KINSHIP_TYPES = new Set<KinshipType>(['spouse', 'husband', 'wife']);

export const KINSHIP_ROLE_PHRASES: Partial<Record<KinshipType, string>> = {
  father: 'әке',
  mother: 'ана',
  grandfather: 'ата',
  grandmother: 'әже',
  nagashy_ata: 'нағашы ата',
  nagashy_aje: 'нағашы әже',
  nagashy_aga: 'нағашы аға',
  nagashy_ini: 'нағашы іні',
  nagashy_apke: 'нағашы апке',
  nagashy_singli: 'нағашы сіңлі',
  kayin_ata: 'қайын ата',
  kayin_ene: 'қайын ене',
  kayin_aga: 'қайын аға',
  kayin_ini: 'қайын іні',
  kayin_apke: 'қайын апке',
  spouse: 'жұбай',
  husband: 'күйеу',
  wife: 'әйел',
};
