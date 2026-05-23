export type FamilyEvent = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  type: 'birthday' | 'holiday' | 'family';
};

export type MemoryArchive = {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  icon: string;
};

export const MOCK_EVENTS: FamilyEvent[] = [
  {
    id: 'ev-1',
    title: 'Наурыз — семейный обед',
    subtitle: 'Барлығы бірге · Вся семья вместе',
    date: '2026-03-22',
    type: 'holiday',
  },
  {
    id: 'ev-2',
    title: 'Той — годовщина родителей',
    subtitle: '25 лет брака · 25 жыл неке',
    date: '2026-06-15',
    type: 'family',
  },
  {
    id: 'ev-3',
    title: 'Сбор на даче',
    subtitle: 'Жазғы демалыс · Летний отдых',
    date: '2026-07-20',
    type: 'family',
  },
];

export const MEMORY_ARCHIVES: MemoryArchive[] = [
  {
    id: 'arch-1',
    title: 'Семейные фото 2024',
    subtitle: 'Наурыз, той, дача',
    year: '2024',
    icon: '📷',
  },
  {
    id: 'arch-2',
    title: 'Рецепты Апа',
    subtitle: 'Бешbarmak, baursak, kurt',
    year: '2023',
    icon: '📖',
  },
  {
    id: 'arch-3',
    title: 'Истории Ата',
    subtitle: 'Жазбалар мен естеліктер',
    year: '2022',
    icon: '🎙️',
  },
];

export const DUA_REMINDER =
  'Бүгін марқұм ата-аналарымызға дұға оқып, еске алу керек. Аллаh разы болсын.';

export const FAMILY_GREETING = 'Ассалаумағалейкум';
