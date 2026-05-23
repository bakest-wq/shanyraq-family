import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { SearchField } from '@/components/ui/SearchField';
import { Relative, RelativeGender } from '@/types/relative';
import {
  FamilyLinkType,
  filterFamilyLinkCandidates,
  getFamilyLinkModalTitle,
  relativeLinkIdsMatch,
} from '@/utils/family-link-picker';
import type { ParentLinkCandidate } from '@/utils/parent-link-candidates';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type LinkCandidate = Relative & {
  isSharedParent?: boolean;
};

type RelativeLinkSelectModalProps = {
  visible: boolean;
  linkType: FamilyLinkType;
  candidates: LinkCandidate[];
  selectedId: string | null | undefined;
  subjectGender?: RelativeGender;
  onSelect: (id: string) => void;
  onClose: () => void;
};

function isParentLinkCandidate(candidate: LinkCandidate): candidate is ParentLinkCandidate {
  return candidate.isSharedParent !== undefined;
}

export function RelativeLinkSelectModal({
  visible,
  linkType,
  candidates,
  selectedId,
  subjectGender,
  onSelect,
  onClose,
}: RelativeLinkSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidates = useMemo(
    () =>
      filterFamilyLinkCandidates(
        candidates,
        linkType,
        subjectGender,
        searchQuery,
      ) as LinkCandidate[],
    [candidates, linkType, searchQuery, subjectGender],
  );

  const groupedCandidates = useMemo(() => {
    if (linkType !== 'father' && linkType !== 'mother') {
      return { shared: [] as LinkCandidate[], other: filteredCandidates };
    }

    const shared = filteredCandidates.filter((candidate) => candidate.isSharedParent);
    const other = filteredCandidates.filter((candidate) => !candidate.isSharedParent);

    return { shared, other };
  }, [filteredCandidates, linkType]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    setSearchQuery('');
    onClose();
  };

  const renderCandidate = (candidate: LinkCandidate) => {
    const selected = relativeLinkIdsMatch(selectedId, candidate.id);

    return (
      <Pressable
        key={candidate.id}
        onPress={() => handleSelect(candidate.id)}
        style={({ pressed }) => [
          styles.option,
          selected && styles.optionSelected,
          pressed && styles.optionPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected }}>
        <AvatarPlaceholder
          name={getRelativeDisplayName(candidate)}
          color={candidate.avatarColor}
          photoUrl={candidate.photoUrl}
          size={48}
        />
        <View style={styles.optionInfo}>
          <Text
            style={[styles.optionName, selected && styles.optionNameSelected]}
            numberOfLines={2}>
            {getRelativeDisplayName(candidate)}
          </Text>
          <Text
            style={[styles.optionRole, selected && styles.optionRoleSelected]}
            numberOfLines={1}>
            {candidate.relationship}
          </Text>
          {candidate.isSharedParent ? (
            <Text
              style={[
                styles.sharedParentsBadge,
                selected && styles.sharedParentsBadgeSelected,
              ]}>
              Ортақ ата-ана
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const showGroupedSections =
    (linkType === 'father' || linkType === 'mother') &&
    groupedCandidates.shared.length > 0 &&
    filteredCandidates.some(isParentLinkCandidate);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{getFamilyLinkModalTitle(linkType)}</Text>

          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Іздеу · Поиск по имени"
          />

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {filteredCandidates.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Туыс табылмады</Text>
                <Text style={styles.emptyText}>
                  Іздеу сөзін өзгертіңіз · немесе жыныс/байланыс сүзгісіне сай туыстар жоқ.
                </Text>
              </View>
            ) : showGroupedSections ? (
              <>
                <Text style={styles.sectionTitle}>Ортақ ата-ана</Text>
                {groupedCandidates.shared.map(renderCandidate)}
                {groupedCandidates.other.length > 0 ? (
                  <>
                    <Text style={styles.sectionTitle}>Басқа туысдар</Text>
                    {groupedCandidates.other.map(renderCandidate)}
                  </>
                ) : null}
              </>
            ) : (
              filteredCandidates.map(renderCandidate)
            )}
          </ScrollView>

          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Жабу · Закрыть</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  card: {
    maxHeight: '88%',
    backgroundColor: Palette.cream,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  title: {
    ...Typography.title,
    color: Palette.greenDeep,
    textAlign: 'center',
  },
  list: {
    maxHeight: 420,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 72,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  optionSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionName: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  optionNameSelected: {
    color: Palette.white,
  },
  optionRole: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  optionRoleSelected: {
    color: Palette.goldLight,
  },
  sharedParentsBadge: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  sharedParentsBadgeSelected: {
    color: Palette.goldLight,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  emptyTitle: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  closeButton: {
    minHeight: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...Typography.bodySmall,
    color: Palette.white,
    fontWeight: '700',
  },
});
