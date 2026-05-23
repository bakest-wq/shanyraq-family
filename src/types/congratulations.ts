export type CongratulationsStyle =
  | 'warm-family'
  | 'islamic'
  | 'formal'
  | 'short-kz'
  | 'humor';

export type CongratulationsInput = {
  fullName: string;
  relationship: string;
  age: number | null;
  birthday: string;
};

export type CongratulationsStyleOption = {
  id: CongratulationsStyle;
  label: string;
  emoji: string;
};

export const CONGRATULATIONS_STYLES: CongratulationsStyleOption[] = [
  { id: 'warm-family', label: 'Тёплое семейное', emoji: '🏠' },
  { id: 'islamic', label: 'Исламское', emoji: '🤲' },
  { id: 'formal', label: 'Официальное', emoji: '📜' },
  { id: 'short-kz', label: 'Қысқа қазақша', emoji: '🇰🇿' },
  { id: 'humor', label: 'С юмором', emoji: '😊' },
];
