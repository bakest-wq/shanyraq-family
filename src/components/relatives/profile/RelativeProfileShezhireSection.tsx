import { Relative } from '@/types/relative';
import { RELATIVE_PROFILE_COPY } from '@/constants/relative-profile-content';
import { formatRuSelectionSummary, hasRuSelection } from '@/utils/ru-dictionary';

import { RelativeProfileInfoRow } from './RelativeProfileInfoRow';
import { RelativeProfileSection } from './RelativeProfileSection';

type RelativeProfileShezhireSectionProps = {
  relative: Relative;
};

export function RelativeProfileShezhireSection({ relative }: RelativeProfileShezhireSectionProps) {
  const selection = {
    zhuz: relative.zhuz,
    ru: relative.ru,
    tribeBranch: relative.tribeBranch,
    ataLine: relative.ataLine,
  };

  if (!hasRuSelection(selection)) {
    return null;
  }

  return (
    <RelativeProfileSection
      title={RELATIVE_PROFILE_COPY.sections.shezhire}
      subtitle={formatRuSelectionSummary(selection)}>
      <RelativeProfileInfoRow
        icon="🏔️"
        label="Жүз"
        value={relative.zhuz?.trim() || '—'}
        empty={!relative.zhuz?.trim()}
      />
      <RelativeProfileInfoRow
        icon="🌾"
        label="Ру"
        value={relative.ru?.trim() || '—'}
        empty={!relative.ru?.trim()}
      />
      <RelativeProfileInfoRow
        icon="🌿"
        label="Тармақ"
        value={relative.tribeBranch?.trim() || '—'}
        empty={!relative.tribeBranch?.trim()}
      />
      <RelativeProfileInfoRow
        icon="📜"
        label="Ата тегі"
        value={relative.ataLine?.trim() || '—'}
        empty={!relative.ataLine?.trim()}
        isLast
      />
    </RelativeProfileSection>
  );
}
