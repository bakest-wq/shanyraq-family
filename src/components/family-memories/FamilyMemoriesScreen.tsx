import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ArchiveCategoryChips } from '@/components/archive/ArchiveCategoryChips';
import { FamilyMemoryCard } from '@/components/family-memories/FamilyMemoryCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { PresetEmptyState, ErrorState } from '@/components/ui/EmptyState';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { FAMILY_MEMORIES_COPY } from '@/constants/family-memories-content';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useArchive } from '@/hooks/useArchive';
import { useRelatives } from '@/hooks/useRelatives';
import { useSafeGoBack } from '@/hooks/useSafeGoBack';
import { MEMORY_TYPE_FILTERS, MemoryType, MemoryTypeFilter } from '@/types/archive';
import {
  filterMemoriesByCategory,
  filterMemoriesByRelative,
  sortMemoriesNewestFirst,
} from '@/utils/archive-filters';
import { confirmDeleteMemory } from '@/utils/confirm-action';
import { Palette, Spacing, Typography } from '@/constants/theme';

type FamilyMemoriesScreenProps = {
  showBackButton?: boolean;
  initialType?: MemoryType;
  initialRelativeId?: string;
};

function parseParam(value?: string | string[]): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw || undefined;
}

function parseMemoryType(value?: string | string[]): MemoryType | undefined {
  const raw = parseParam(value);
  if (!raw) {
    return undefined;
  }

  return MEMORY_TYPE_FILTERS.some((option) => option.id === raw) && raw !== 'all'
    ? (raw as MemoryType)
    : undefined;
}

export function FamilyMemoriesScreen({
  showBackButton = true,
  initialType,
  initialRelativeId,
}: FamilyMemoriesScreenProps) {
  const router = useRouter();
  const goBack = useSafeGoBack();
  const { type: typeParam, relativeId: relativeIdParam } = useLocalSearchParams<{
    type?: string | string[];
    relativeId?: string | string[];
  }>();
  const routeType = parseMemoryType(typeParam);
  const routeRelativeId = parseParam(relativeIdParam) ?? initialRelativeId;
  const { relatives } = useRelatives();
  const { memories, loading, error, isEmpty, refetch, removeMemory } = useArchive();
  const [typeFilter, setTypeFilter] = useState<MemoryTypeFilter>(routeType ?? initialType ?? 'all');
  const [refreshing, setRefreshing] = useState(false);

  const relative = useMemo(
    () => relatives.find((item) => item.id === routeRelativeId) ?? null,
    [relatives, routeRelativeId],
  );

  useEffect(() => {
    const nextType = routeType ?? initialType;
    if (nextType) {
      setTypeFilter(nextType);
    }
  }, [initialType, routeType]);

  const filteredMemories = useMemo(() => {
    let next = memories;

    if (routeRelativeId) {
      next = filterMemoriesByRelative(next, routeRelativeId);
    }

    next = filterMemoriesByCategory(next, typeFilter);
    return sortMemoriesNewestFirst(next);
  }, [memories, routeRelativeId, typeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch({ silent: true });
    setRefreshing(false);
  };

  const handleAddMemory = () => {
    router.push({
      pathname: '/add-memory',
      params: {
        ...(routeRelativeId ? { relativeId: routeRelativeId } : {}),
        ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
      },
    });
  };

  const confirmDelete = (memoryId: string) => {
    confirmDeleteMemory(() => {
      void removeMemory(memoryId);
    });
  };

  const screenTitle = relative
    ? `${relative.fullName} — естеліктері`
    : FAMILY_MEMORIES_COPY.screenTitle;

  const screenSubtitle = relative
    ? FAMILY_MEMORIES_COPY.profileHint
    : FAMILY_MEMORIES_COPY.screenSubtitle;

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <>
          {showBackButton ? (
            <Pressable onPress={goBack} style={styles.backButton}>
              <Text style={styles.backText}>← Артқа</Text>
            </Pressable>
          ) : null}
          <AppHeader title={screenTitle} subtitle={screenSubtitle} badge="📚" />
        </>
      }
      contentStyle={styles.content}>
      {!isEmpty ? (
        <ArchiveCategoryChips
          options={MEMORY_TYPE_FILTERS}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      ) : null}

      {loading ? (
        <LoadingState message="Естеліктер жүктелуде..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <PresetEmptyState preset={EMPTY_STATE_PRESETS.memories} onAction={handleAddMemory} />
        </View>
      ) : filteredMemories.length === 0 ? (
        <View style={styles.emptyWrap}>
          <PresetEmptyState preset={EMPTY_STATE_PRESETS.memoriesFiltered} onAction={handleAddMemory} />
        </View>
      ) : (
        <View style={styles.section}>
          <SectionTitle
            title="Естеліктер"
            subtitle={`${filteredMemories.length} жазба`}
          />
          <View style={styles.list}>
            {filteredMemories.map((memory) => (
              <FamilyMemoryCard
                key={memory.id}
                memory={memory}
                onLongPress={() => confirmDelete(memory.id)}
              />
            ))}
          </View>
        </View>
      )}

      {!loading && !error && !isEmpty ? (
        <PrimaryButton
          label={FAMILY_MEMORIES_COPY.profileAdd}
          variant="green"
          onPress={handleAddMemory}
        />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backText: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  content: {
    gap: Spacing.lg,
  },
  emptyWrap: {
    paddingVertical: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
});
