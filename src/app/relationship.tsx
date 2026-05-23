import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RelativeSelectModal } from '@/components/relatives/RelativeSelectModal';
import { RelationshipExplanationCard } from '@/components/relatives/RelationshipExplanationCard';
import { Card } from '@/components/ui/Card';
import { PresetEmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { useRelatives } from '@/hooks/useRelatives';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { findRelationship, formatRelationshipLabel, formatRelationshipPath } from '@/utils/relationship-engine';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type PersonSlot = 'a' | 'b';

const EMPTY_LABEL = 'Таңдаңыз · Выберите';

export default function RelationshipScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string; to?: string }>();
  const { relatives, loading } = useRelatives();
  const { myRelative } = useUserIdentity();
  const [personA, setPersonA] = useState<Relative | null>(null);
  const [personB, setPersonB] = useState<Relative | null>(null);
  const [activeSlot, setActiveSlot] = useState<PersonSlot | null>(null);

  const initialA = useMemo(
    () =>
      relatives.find((relative) => relative.id === params.from) ??
      myRelative ??
      null,
    [myRelative, params.from, relatives],
  );
  const initialB = useMemo(
    () => relatives.find((relative) => relative.id === params.to) ?? null,
    [params.to, relatives],
  );

  const selectedA = personA ?? initialA;
  const selectedB = personB ?? initialB;

  const result = useMemo(() => {
    if (!selectedA || !selectedB) {
      return null;
    }

    return findRelationship(selectedA, selectedB, relatives);
  }, [relatives, selectedA, selectedB]);

  const openPicker = (slot: PersonSlot) => {
    setActiveSlot(slot);
  };

  const handleSelect = (relative: Relative) => {
    if (activeSlot === 'a') {
      setPersonA(relative);
      return;
    }

    if (activeSlot === 'b') {
      setPersonB(relative);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Жүктелуде · Загрузка..." />
      </SafeAreaView>
    );
  }

  if (relatives.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <Text style={styles.title}>Туыстық</Text>
          <Text style={styles.subtitle}>Relationship · Шежіре байланысы</Text>
        </View>
        <View style={styles.emptyWrap}>
          <PresetEmptyState
            preset={EMPTY_STATE_PRESETS.relationshipNoRelatives}
            onAction={() =>
              router.push({
                pathname: '/add-relative',
                params: selectedA ? { rootId: selectedA.id } : undefined,
              })
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>
        <Text style={styles.title}>Туыстық</Text>
        <Text style={styles.subtitle}>Relationship · Шежіре байланысы</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Card goldBorder style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>1-адам · Человек A</Text>
          <PersonPickerCard
            label="A"
            relative={selectedA}
            onPress={() => openPicker('a')}
          />
        </Card>

        <Card goldBorder style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>2-адам · Человек B</Text>
          <PersonPickerCard
            label="B"
            relative={selectedB}
            onPress={() => openPicker('b')}
          />
        </Card>

        <Card style={styles.resultCard}>
          <Text style={styles.resultLabel}>Нәтиже · Результат</Text>
          {selectedA && selectedB ? (
            <>
              <Text style={styles.resultNames}>
                {getRelativeDisplayName(selectedA)} → {getRelativeDisplayName(selectedB)}
              </Text>
              <Text
                style={[
                  styles.resultValue,
                  result?.type === 'unknown' && styles.resultUnknown,
                ]}>
                {result ? formatRelationshipLabel(result.label) : EMPTY_LABEL}
              </Text>

              {result?.path ? (
                <View style={styles.pathWrap}>
                  <Text style={styles.pathLabel}>Туыстық жолы · Relationship path</Text>
                  <Text style={styles.pathValue}>{formatRelationshipPath(result.path)}</Text>
                </View>
              ) : null}

              {result?.hint ? (
                <Text style={styles.resultHint}>{formatRelationshipPath(result.hint)}</Text>
              ) : null}

              {result &&
              result.type !== 'unknown' &&
              result.type !== 'self' &&
              !result.path ? (
                <Text style={styles.resultHint}>
                  {`B — A-ның ${result.label.kazakh.toLowerCase()} · B is A's ${result.label.russian.toLowerCase()}`}
                </Text>
              ) : null}
            </>
          ) : (
            <PresetEmptyState
              preset={EMPTY_STATE_PRESETS.relationship}
              style={styles.nestedEmpty}
            />
          )}
        </Card>

        {selectedA && selectedB ? (
          <RelationshipExplanationCard
            personA={selectedA}
            personB={selectedB}
            relatives={relatives}
          />
        ) : null}
      </ScrollView>

      <RelativeSelectModal
        visible={activeSlot !== null}
        title={activeSlot === 'a' ? '1-адамды таңдау · Выбрать A' : '2-адамды таңдау · Выбрать B'}
        relatives={relatives}
        selectedId={activeSlot === 'a' ? selectedA?.id : selectedB?.id}
        excludeId={activeSlot === 'a' ? selectedB?.id : selectedA?.id}
        onSelect={handleSelect}
        onClose={() => setActiveSlot(null)}
      />
    </SafeAreaView>
  );
}

type PersonPickerCardProps = {
  label: string;
  relative: Relative | null;
  onPress: () => void;
};

function PersonPickerCard({ label, relative, onPress }: PersonPickerCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.personCard, pressed && styles.personCardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${label} · Таңдау`}>
      {relative ? (
        <View style={styles.personRow}>
          <AvatarPlaceholder
            name={getRelativeDisplayName(relative)}
            color={relative.avatarColor}
            photoUrl={relative.photoUrl}
            size={56}
          />
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{getRelativeDisplayName(relative)}</Text>
            <Text style={styles.personMeta}>{relative.relationship}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.personEmpty}>{EMPTY_LABEL}</Text>
      )}
      <Text style={styles.pickAction}>Таңдау · Выбрать</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  backText: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  title: {
    ...Typography.hero,
    color: Palette.greenDeep,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  sectionCard: {
    gap: Spacing.md,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  personCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.soft,
  },
  personCardPressed: {
    opacity: 0.92,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  personInfo: {
    flex: 1,
    gap: 2,
  },
  personName: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  personMeta: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  personEmpty: {
    ...Typography.body,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  pickAction: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultCard: {
    gap: Spacing.sm,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  resultLabel: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    fontWeight: '700',
  },
  resultNames: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  resultValue: {
    ...Typography.hero,
    color: Palette.greenDeep,
    textAlign: 'center',
  },
  resultUnknown: {
    color: Palette.textSecondary,
    ...Typography.subtitle,
  },
  pathWrap: {
    width: '100%',
    marginTop: Spacing.sm,
    backgroundColor: Palette.cream,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  pathLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  pathValue: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  resultHint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultPlaceholder: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  nestedEmpty: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: Spacing.sm,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
