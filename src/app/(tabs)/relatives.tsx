import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { FilterChips } from '@/components/ui/FilterChips';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RelativeListCard } from '@/components/ui/RelativeListCard';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SearchField } from '@/components/ui/SearchField';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useRelatives } from '@/hooks/useRelatives';
import {
  filterRelatives,
  RELATIVE_FILTERS,
  RelativeFilter,
} from '@/utils/relatives-filters';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function RelativesScreen() {
  const router = useRouter();
  const { highlightId } = useLocalSearchParams<{ highlightId?: string | string[] }>();
  const resolvedHighlightId = Array.isArray(highlightId) ? highlightId[0] : highlightId;
  const { relatives, loading, error, isEmpty, refetch } = useRelatives();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RelativeFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const listOffsetRef = useRef(0);
  const itemOffsetsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!resolvedHighlightId) {
      return;
    }

    setSearchQuery('');
    setActiveFilter('all');
  }, [resolvedHighlightId]);

  const filteredRelatives = useMemo(
    () => filterRelatives(relatives, searchQuery, activeFilter),
    [relatives, searchQuery, activeFilter],
  );

  const scrollToHighlightedRelative = useCallback(() => {
    if (!resolvedHighlightId || loading) {
      return;
    }

    const itemY = itemOffsetsRef.current[resolvedHighlightId];
    if (itemY === undefined) {
      return;
    }

    scrollRef.current?.scrollTo({
      y: Math.max(0, listOffsetRef.current + itemY - Spacing.lg),
      animated: true,
    });
  }, [loading, resolvedHighlightId]);

  useEffect(() => {
    if (!resolvedHighlightId || loading) {
      return;
    }

    const timer = setTimeout(() => {
      scrollToHighlightedRelative();
    }, 300);

    return () => clearTimeout(timer);
  }, [loading, resolvedHighlightId, filteredRelatives.length, scrollToHighlightedRelative]);

  useEffect(() => {
    if (!resolvedHighlightId) {
      return;
    }

    const timer = setTimeout(() => {
      router.setParams({ highlightId: '' });
    }, 3200);

    return () => clearTimeout(timer);
  }, [resolvedHighlightId, router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch({ silent: true });
    setRefreshing(false);
  }, [refetch]);

  const headerSubtitle = `${filteredRelatives.length} из ${relatives.length} · родственников`;

  return (
    <ScreenShell
      scrollRef={scrollRef}
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <AppHeader
          title="Туыстар"
          subtitle={loading ? 'Загрузка...' : headerSubtitle}
        />
      }
      contentStyle={styles.content}>
      {loading ? (
        <LoadingState message="Туыстар жүктелуде..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="👨‍👩‍👧‍👦"
            title="Пока нет родственников. Добавьте первого."
            subtitle="Туыс қосу · Добавить родственника"
            actionLabel="Добавить родственника"
            onAction={() => router.push('/add-relative')}
          />
        </View>
      ) : (
        <>
          <SectionTitle
            title="Отбасыңыз"
            subtitle="Поиск, фильтры и быстрые действия"
          />

          <SearchField value={searchQuery} onChangeText={setSearchQuery} />

          <FilterChips
            options={RELATIVE_FILTERS}
            value={activeFilter}
            onChange={setActiveFilter}
          />

          {filteredRelatives.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsTitle}>Ничего не найдено</Text>
              <Text style={styles.noResultsText}>
                Попробуйте другой запрос или фильтр
              </Text>
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
                  <RelativeListCard
                    relative={relative}
                    highlighted={relative.id === resolvedHighlightId}
                  />
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
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
