import { Relative } from '@/types/relative';
import { calculateAge, formatBirthdayKzRu, getAgeLabel } from '@/utils/dates';
import { getGenderLabel } from '@/utils/relative-profile';

import { RelativeProfileInfoRow } from './RelativeProfileInfoRow';
import { RelativeProfileSection } from './RelativeProfileSection';

type RelativeProfileInfoSectionProps = {
  relative: Relative;
  onCallPhone?: () => void;
};

export function RelativeProfileInfoSection({
  relative,
  onCallPhone,
}: RelativeProfileInfoSectionProps) {
  const age = calculateAge(relative);
  const birthday = formatBirthdayKzRu(relative);
  const hasBirthday = birthday !== '—';
  const hasPhone = Boolean(relative.phone?.trim());
  const hasGender = Boolean(relative.gender);

  return (
    <RelativeProfileSection title="Негізгі деректер · Основное" subtitle="Туған күн, жасы, байланыс">
      <RelativeProfileInfoRow
        icon="🎂"
        label="Туған күні · Дата рождения"
        value={birthday}
        empty={!hasBirthday}
      />
      <RelativeProfileInfoRow
        icon="🌿"
        label="Жасы · Возраст"
        value={age !== null ? getAgeLabel(age) : 'Жыл белгісіз · Год неизвестен'}
        empty={age === null}
      />
      <RelativeProfileInfoRow
        icon="📞"
        label="Телефон · WhatsApp"
        value={hasPhone ? relative.phone : 'Көрсетілмеген · Не указан'}
        empty={!hasPhone}
        onPress={hasPhone ? onCallPhone : undefined}
      />
      <RelativeProfileInfoRow
        icon="👤"
        label="Жынысы · Пол"
        value={hasGender ? getGenderLabel(relative.gender) : 'Көрсетілмеген · Не указан'}
        empty={!hasGender}
        isLast
      />
    </RelativeProfileSection>
  );
}
