import type { RefObject } from 'react';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PresetEmptyState, ErrorState } from '@/components/ui/EmptyState';
import { OnboardingHintsCard } from '@/components/ui/OnboardingHintsCard';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { FilterChips } from '@/components/ui/FilterChips';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RelativeListCard } from '@/components/ui/RelativeListCard';
import { SearchField } from '@/components/ui/SearchField';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Relative } from '@/types/relative';
import {
  filterRelatives,
  RELATIVE_FILTERS,
  RelativeFilter,
} from '@/utils/relatives-filters';
import { Palette, Spacing, Typography } from '@/constants/theme';

type RelativesListPanelProps = {
  relatives: Relative[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  highlightId?: string;
  scrollRef?: RefObject<ScrollView | null>;
  onRetry: () => void;
};

export function RelativesListPanel({
  relatives,
  loading,
  error,
  isEmpty,
  highlightId,
  scrollRef,
  onRetry,
}: RelativesListPanelProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RelativeFilter>('all');
  const listOffsetRef = useRef(0);
  const itemOffsetsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!highlightId) {
      return;
    }

    setSearchQuery('');
    setActiveFilter('all');
  }, [highlightId]);

  const filteredRelatives = useMemo(
    () => filterRelatives(relatives, searchQuery, activeFilter),
    [relatives, searchQuery, activeFilter],
  );

  const scrollToHighlightedRelative = useCallback(() => {
    if (!highlightId || loading || !scrollRef) {
      return;
    }

    const itemY = itemOffsetsRef.current[highlightId];
    if (itemY === undefined) {
      return;
    }

    scrollRef.current?.scrollTo({
      y: Math.max(0, listOffsetRef.current + itemY - Spacing.lg),
      animated: true,
    });
  }, [highlightId, loading, scrollRef]);

  useEffect(() => {
    if (!highlightId || loading) {
      return;
    }

    const timer = setTimeout(() => {
      scrollToHighlightedRelative();
    }, 300);

    return () => clearTimeout(timer);
  }, [highlightId, loading, filteredRelatives.length, scrollToHighlightedRelative]);

  useEffect(() => {
    if (!highlightId) {
      return;
    }

    const timer = setTimeout(() => {
      router.setParams({ highlightId: '' });
    }, 3200);

    return () => clearTimeout(timer);
  }, [highlightId, router]);

  if (loading) {
    return null;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return (
      <View style={styles.emptyWrap}>
        <PresetEmptyState preset={EMPTY_STATE_PRESETS.relatives} />
        <OnboardingHintsCard />
      </View>
    );
  }

  return (
    <>
      <SectionTitle title="Отбасыңыз" subtitle="Поиск, фильтры и быстрые действия" />

      <SearchField value={searchQuery} onChangeText={setSearchQuery} />

      <FilterChips options={RELATIVE_FILTERS} value={activeFilter} onChange={setActiveFilter} />

      {filteredRelatives.length === 0 ? (
        <View style={styles.noResults}>
          <Text style={styles.noResultsTitle}>Ничего не найдено</Text>
          <Text style={styles.noResultsText}>Попробуйте другой запрос или фильтр</Text>
          <PrimaryButton
            label="Сбросить фильтры"
            variant="gold"
            onPress={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
          />
        </View>
      ) : (
        <View
          style={styles.list}
          onLayout={(event) => {
            listOffsetRef.current = event.nativeEvent.layout.y;
          }}>
          {filteredRelatives.map((relative) => (
            <View
              key={relative.id}
              onLayout={(event) => {
                itemOffsetsRef.current[relative.id] = event.nativeEvent.layout.y;
              }}>
              <RelativeListCard relative={relative} highlighted={relative.id === highlightId} />
            </View>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
  },
  list: {
    gap: Spacing.md,
  },
  noResults: {
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Palette.white,
    borderRadius: 20,
    padding: Spacing.xl,
  },
  noResultsTitle: {
    ...Typography.subtitle,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  noResultsText: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
});
