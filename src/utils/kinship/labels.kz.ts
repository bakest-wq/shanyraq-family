import type { KinshipLabel, KinshipType } from '@/utils/kinship/types';

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
  grandfather: { kazakh: 'Ата', russian: 'Дедушка', subtitle: 'әке жағы' },
  grandmother: { kazakh: 'Әже', russian: 'Бабушка', subtitle: 'әке жағы' },
  nemere: { kazakh: 'Немере', russian: 'Внук / внучка' },
  shobere: { kazakh: 'Шөбере', russian: 'Правнук / правнучка' },
  jenge: {
    kazakh: 'Жеңге',
    russian: 'Жена брата',
    subtitle: 'бауырдың жұбайы',
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
    subtitle: 'бауыр баласы',
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

export function formatKinshipCardLine(result: {
  label: KinshipLabel;
  uncertain: boolean;
  resolved?: boolean;
  type?: string;
}): string {
  if (result.type === 'unknown' || result.resolved === false) {
    return UNKNOWN_KINSHIP.kazakh;
  }

  return result.uncertain ? `${result.label.kazakh} (мүмкін)` : result.label.kazakh;
}

export function formatKinshipCardSubtitle(result: {
  label: KinshipLabel;
  uncertain: boolean;
  resolved?: boolean;
  type?: string;
}): string | null {
  if (result.type === 'unknown' || result.resolved === false) {
    return null;
  }

  return result.label.russian;
}

export function formatKinshipBadge(result: {
  label: KinshipLabel;
  uncertain: boolean;
  resolved?: boolean;
  type?: string;
}): string {
  const kazakh = formatKinshipCardLine(result);
  const russian = formatKinshipCardSubtitle(result);
  return russian ? `${kazakh} · ${russian}` : kazakh;
}
