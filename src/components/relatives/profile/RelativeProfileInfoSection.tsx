import { Relative } from '@/types/relative';
import { RELATIVE_PROFILE_COPY } from '@/constants/relative-profile-content';

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
  const hasPhone = Boolean(relative.phone?.trim());

  if (!hasPhone) {
    return null;
  }

  return (
    <RelativeProfileSection title={RELATIVE_PROFILE_COPY.sections.contact}>
      <RelativeProfileInfoRow
        icon="📞"
        label="Телефон"
        value={relative.phone}
        onPress={onCallPhone}
        isLast
      />
    </RelativeProfileSection>
  );
}
