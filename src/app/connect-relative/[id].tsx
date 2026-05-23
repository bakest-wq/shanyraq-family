import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AvatarPlaceholder } from '@/components/ui/RelativeCard';
import { useConnectParents, useRelative, useRelatives } from '@/hooks/useRelatives';
import { Relative } from '@/types/relative';
import { getAllParentCandidates } from '@/utils/family-tree';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type ParentPickerProps = {
  label: string;
  sublabel: string;
  selectedId: string | null;
  candidates: Relative[];
  onSelect: (id: string | null) => void;
};

function ParentPicker({ label, sublabel, selectedId, candidates, onSelect }: ParentPickerProps) {
  return (
    <Card style={styles.pickerCard}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Text style={styles.pickerSub}>{sublabel}</Text>
      <Pressable onPress={() => onSelect(null)} style={styles.noneChip}>
        <Text style={[styles.chipText, selectedId === null && styles.chipTextSelected]}>
          Не выбрано
        </Text>
      </Pressable>
      <View style={styles.chipGrid}>
        {candidates.map((candidate) => {
          const selected = selectedId === candidate.id;
          return (
            <Pressable
              key={candidate.id}
              onPress={() => onSelect(candidate.id)}
              style={[styles.chip, selected && styles.chipSelected]}>
              <AvatarPlaceholder name={candidate.fullName} color={candidate.avatarColor} size={36} />
              <Text style={[styles.chipName, selected && styles.chipNameSelected]} numberOfLines={2}>
                {candidate.fullName}
              </Text>
              <Text style={[styles.chipRole, selected && styles.chipRoleSelected]}>
                {candidate.relationship}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

export default function ConnectRelativeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const relativeId = Array.isArray(id) ? id[0] : id;
  const { relative, loading } = useRelative(relativeId ?? '');
  const { relatives } = useRelatives();
  const { connectParents, saving, error: saveError } = useConnectParents(relativeId ?? '');

  const [fatherId, setFatherId] = useState<string | null>(null);
  const [motherId, setMotherId] = useState<string | null>(null);

  useEffect(() => {
    if (relative) {
      setFatherId(relative.fatherId ?? null);
      setMotherId(relative.motherId ?? null);
    }
  }, [relative]);

  const candidates = useMemo(() => {
    if (!relativeId) {
      return [];
    }
    return getAllParentCandidates(relatives, relativeId);
  }, [relatives, relativeId]);

  const handleSave = async () => {
    if (!relativeId) {
      return;
    }

    if (fatherId === relativeId || motherId === relativeId) {
      Alert.alert('Қате', 'Нельзя выбрать того же человека.');
      return;
    }

    const updated = await connectParents({ fatherId, motherId });

    if (updated) {
      Alert.alert('Сохранено', 'Связи обновлены.', [
        { text: 'Жарайды', onPress: () => router.back() },
      ]);
    }
  };

  if (!relativeId) {
    return null;
  }

  if (loading && !relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Жүктелуде..." />
      </SafeAreaView>
    );
  }

  if (!relative) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Родственник не найден</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Артқа</Text>
        </Pressable>

        <Text style={styles.title}>Связать родственника</Text>
        <Text style={styles.subtitle}>Туыс байлау · Connect to parents</Text>

        <Card goldBorder style={styles.childCard}>
          <AvatarPlaceholder name={relative.fullName} color={relative.avatarColor} size={64} />
          <Text style={styles.childName}>{relative.fullName}</Text>
          <Text style={styles.childRole}>{relative.relationship}</Text>
        </Card>

        <ParentPicker
          label="Әke · Отец"
          sublabel="Выберите отца"
          selectedId={fatherId}
          candidates={candidates}
          onSelect={setFatherId}
        />

        <ParentPicker
          label="Ана · Мать"
          sublabel="Выберите мать"
          selectedId={motherId}
          candidates={candidates}
          onSelect={setMotherId}
        />

        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

        <PrimaryButton
          label={saving ? 'Сохранение...' : 'Сохранить связи'}
          sublabel="Supabase-қа сақтау"
          variant="green"
          onPress={saving ? undefined : () => void handleSave()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
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
  childCard: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  childName: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  childRole: {
    ...Typography.bodySmall,
    color: Palette.gold,
    fontWeight: '700',
  },
  pickerCard: {
    gap: Spacing.sm,
  },
  pickerLabel: {
    ...Typography.bodySmall,
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  pickerSub: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  noneChip: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    width: '48%',
    backgroundColor: Palette.cream,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Palette.creamDark,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 100,
  },
  chipSelected: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  chipName: {
    ...Typography.caption,
    color: Palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  chipNameSelected: {
    color: Palette.white,
  },
  chipRole: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  chipRoleSelected: {
    color: Palette.goldLight,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Palette.danger,
    textAlign: 'center',
  },
});
