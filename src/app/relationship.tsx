import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RelativeSelectModal } from '@/components/relatives/RelativeSelectModal';
import { KinshipResultBadge } from '@/components/ui/KinshipBadge';
import { Card } from '@/components/ui/Card';
import { PresetEmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { useRelatives } from '@/hooks/useRelatives';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { useRootPersonIdentity } from '@/hooks/useRootPersonIdentity';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { Relative } from '@/types/relative';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { getKinshipCardLine, getKinshipExplanationBetween } from '@/services/kinship.service';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type PersonSlot = 'a' | 'b';

const EMPTY_LABEL = 'Таңдаңыз';

export default function RelationshipScreen() {
  const router = useRouter();
  const goBack = useSafeGoBack();
  const params = useLocalSearchParams<{ from?: string; to?: string }>();
  const { relatives, loading } = useRelatives();
  const { myRelative } = useUserIdentity();
  const { rootPerson } = useRootPersonIdentity();
  const [personA, setPersonA] = useState<Relative | null>(null);
  const [personB, setPersonB] = useState<Relative | null>(null);
  const [activeSlot, setActiveSlot] = useState<PersonSlot | null>(null);

  const initialA = useMemo(
    () =>
      relatives.find((relative) => relative.id === params.from) ??
      rootPerson ??
      myRelative ??
      null,
    [myRelative, params.from, relatives, rootPerson],
  );
  const initialB = useMemo(
    () => relatives.find((relative) => relative.id === params.to) ?? null,
    [params.to, relatives],
  );

  const selectedA = personA ?? initialA;
  const selectedB = personB ?? initialB;

  const kinshipView = useMemo(() => {
    if (!selectedA || !selectedB) {
      return null;
    }

    const root = selectedA;
    return {
      root,
      explanation: getKinshipExplanationBetween(root, selectedB, relatives),
      cardLine: getKinshipCardLine(root, selectedB, relatives),
    };
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
        <LoadingState message="Жүктелуде..." />
      </SafeAreaView>
    );
  }

  if (relatives.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>← Артқа</Text>
          </Pressable>
          <Text style={styles.title}>Туыстық</Text>
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
        <Pressable onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>
        <Text style={styles.title}>Туыстық</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Card goldBorder style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>1-адам</Text>
          <PersonPickerCard
            label="A"
            relative={selectedA}
            onPress={() => openPicker('a')}
          />
        </Card>

        <Card goldBorder style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>2-адам</Text>
          <PersonPickerCard
            label="B"
            relative={selectedB}
            onPress={() => openPicker('b')}
          />
        </Card>

        <Card style={styles.resultCard}>
          <Text style={styles.resultLabel}>Туыстық атауы</Text>
          {selectedA && selectedB && kinshipView ? (
            <>
              <KinshipResultBadge label={kinshipView.cardLine} />
              <Text style={styles.resultSummary}>{kinshipView.explanation.summary}</Text>
              {kinshipView.explanation.hint ? (
                <Text style={styles.resultHint}>{kinshipView.explanation.hint}</Text>
              ) : null}
            </>
          ) : (
            <PresetEmptyState
              preset={EMPTY_STATE_PRESETS.relationship}
              style={styles.nestedEmpty}
            />
          )}
        </Card>
      </ScrollView>

      <RelativeSelectModal
        visible={activeSlot !== null}
        title={activeSlot === 'a' ? '1-адамды таңдау' : '2-адамды таңдау'}
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
          </View>
        </View>
      ) : (
        <Text style={styles.personEmpty}>{EMPTY_LABEL}</Text>
      )}
      <Text style={styles.pickAction}>Таңдау</Text>
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
  resultSummary: {
    ...Typography.body,
    color: Palette.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultHint: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
