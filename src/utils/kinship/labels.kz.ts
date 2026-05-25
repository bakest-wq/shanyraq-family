import type { KinshipLabel, KinshipResult, KinshipType } from '@/utils/kinship/types';
import { formatKinshipMainLabel } from '@/utils/kinship/kinship-display';

export const GENDER_HINT_KZ =
  'Жынысын көрсетсеңіз, байланыс дәлірек анықталады';

export const UNKNOWN_KINSHIP: KinshipLabel = {
  kazakh: 'Байланыс толық анықталмады',
  russian: 'Связь не определена полностью',
};

export const KINSHIP_LABELS: Record<KinshipType, KinshipLabel> = {
  self: { kazakh: 'Мен', russian: 'Я' },
  father: { kazakh: 'Әке', russian: 'Отец' },
  mother: { kazakh: 'Ана', russian: 'Мать' },
  son: { kazakh: 'Ұл', russian: 'Сын' },
  daughter: { kazakh: 'Қыз', russian: 'Дочь' },
  spouse: { kazakh: 'Жұбайы', russian: 'Супруг(а)' },
  husband: { kazakh: 'Күйеуі', russian: 'Супруг' },
  wife: { kazakh: 'Әйелі', russian: 'Супруга' },
  aga: { kazakh: 'Аға', russian: 'Старший брат' },
  ini: { kazakh: 'Іні', russian: 'Младший брат' },
  apke: { kazakh: 'Әпке', russian: 'Старшая сестра' },
  singli: { kazakh: 'Қарындас', russian: 'Младшая сестра' },
  sibling_neutral: {
    kazakh: 'Бауыр',
    russian: 'Брат / сестра',
    subtitle: 'жас нақтыланбаған',
  },
  grandfather: { kazakh: 'Әке жағынан ата', russian: 'Дедушка', subtitle: 'әке жағы' },
  grandmother: { kazakh: 'Әке жағынан әже', russian: 'Бабушка', subtitle: 'әке жағы' },
  nemere: { kazakh: 'Немере', russian: 'Внук / внучка' },
  shobere: { kazakh: 'Шөбере', russian: 'Правнук / правнучка' },
  jenge: {
    kazakh: 'Жеңге',
    russian: 'Жена брата',
    subtitle: 'аға бауырдың жұбайы',
  },
  brother_wife_neutral: {
    kazakh: 'Бауырының жұбайы',
    russian: 'Жена брата',
    subtitle: 'жас нақтыланбаған',
  },
  jezde: {
    kazakh: 'Жезде',
    russian: 'Муж сестры',
    subtitle: 'апа-сіңілдің жұбайы',
  },
  kelin: {
    kazakh: 'Келін',
    russian: 'Невестка',
    subtitle: 'ұлыңыздың жұбайы',
  },
  kuyeu_bala: {
    kazakh: 'Күйеу бала',
    russian: 'Зять',
    subtitle: 'қызыңыздың жұбайы',
  },
  kayin_ata: { kazakh: 'Қайын ата', russian: 'Тесть / свёкор' },
  kayin_ene: { kazakh: 'Қайын ене', russian: 'Тёща / свекровь' },
  kayin_aga: { kazakh: 'Қайын аға', russian: 'Старший брат супруга' },
  kayin_ini: { kazakh: 'Қайын іні', russian: 'Младший брат супруга' },
  kayin_apke: { kazakh: 'Қайын әпке', russian: 'Старшая сестра супруга' },
  kayin_singli: {
    kazakh: 'Қайын сіңлі',
    russian: 'Младшая сестра супруга',
    subtitle: 'қайын қарындас',
  },
  kayin_neutral: {
    kazakh: 'Қайын туыс',
    russian: 'Родня супруга',
    subtitle: 'жас нақтыланбаған',
  },
  kayin_jurt: {
    kazakh: 'Қайын жұрт',
    russian: 'Родня супруга',
    subtitle: 'жұбай жағынан',
  },
  abysyn: {
    kazakh: 'Абысын',
    russian: 'Жена брата супруга',
    subtitle: 'жұбай аға/інінің жұбайы',
  },
  kayin_jezde: {
    kazakh: 'Қайын жезде',
    russian: 'Муж сестры супруга',
    subtitle: 'жұбай әпке/сіңлідің жұбайы',
  },
  nagashy_ata: { kazakh: 'Нағашы ата', russian: 'Дедушка по матери' },
  nagashy_aje: { kazakh: 'Нағашы әже', russian: 'Бабушка по матери' },
  nagashy_aga: { kazakh: 'Нағашы аға', russian: 'Дядя по матери (старший)' },
  nagashy_ini: { kazakh: 'Нағашы іні', russian: 'Дядя по матери (младший)' },
  nagashy_apke: { kazakh: 'Нағашы әпке', russian: 'Тётя по матери (старшая)' },
  nagashy_singli: { kazakh: 'Нағашы сіңлі', russian: 'Тётя по матери (младшая)' },
  nagashy_neutral: {
    kazakh: 'Нағашы',
    russian: 'Родня по матери',
    subtitle: 'ана жағы',
  },
  paternal_aga: {
    kazakh: 'Әkenің ағасы',
    russian: 'Дядя по отцу (старший)',
    subtitle: 'әke жағы',
  },
  paternal_ini: {
    kazakh: 'Әkenің інісі',
    russian: 'Дядя по отцу (младший)',
    subtitle: 'әke жағы',
  },
  paternal_apke: {
    kazakh: 'Әkenің әпкesi',
    russian: 'Тётя по отцу (старшая)',
    subtitle: 'әke жағы',
  },
  paternal_singli: {
    kazakh: 'Әkenің qarindaсы',
    russian: 'Тётя по отцу (младшая)',
    subtitle: 'әke жағы',
  },
  paternal_neutral: {
    kazakh: 'Әke жағы туыс',
    russian: 'Родня по отцу',
    subtitle: 'әулет жағы',
  },
  zhien: {
    kazakh: 'Жиен',
    russian: 'Племянник / племянница',
    subtitle: 'апа-сіңлі баласы',
  },
  brother_child_older: {
    kazakh: 'Ағаңыздың баласы',
    russian: 'Ребёнок старшего брата',
    subtitle: 'аға баласы',
  },
  brother_child_younger: {
    kazakh: 'Ініңіздің баласы',
    russian: 'Ребёнок младшего брата',
    subtitle: 'іні баласы',
  },
  brother_child_neutral: {
    kazakh: 'Бауырыңыздың баласы',
    russian: 'Ребёнок брата',
    subtitle: 'жас нақтыланбаған',
  },
  bole: {
    kazakh: 'Бөле',
    russian: 'Двоюродный брат / сестра',
    subtitle: 'ана апалы-сіңлі',
  },
  tuas: {
    kazakh: 'Туас',
    russian: 'Двоюродный брат / сестра',
    subtitle: 'ата-ана туыс баласы',
  },
  kuda: { kazakh: 'Құда', russian: 'Сват' },
  kudagi: { kazakh: 'Құдағи', russian: 'Сватья' },
  kuda_neutral: {
    kazakh: 'Құдалық байланыс',
    russian: 'Сводство',
    subtitle: 'бала жұбайы жағынан',
  },
  relative_neutral: {
    kazakh: 'Туыс',
    russian: 'Родственник',
    subtitle: 'жыныс нақтыланбаған',
  },
  unknown: UNKNOWN_KINSHIP,
};

export function getKinshipLabelText(type: KinshipType): KinshipLabel {
  return KINSHIP_LABELS[type] ?? UNKNOWN_KINSHIP;
}

export function formatKinshipCardLine(result: KinshipResult): string {
  return formatKinshipMainLabel(result);
}

export function formatKinshipCardSubtitle(_result: KinshipResult): string | null {
  return null;
}

export function formatKinshipBadge(result: KinshipResult): string {
  return formatKinshipMainLabel(result);
}
