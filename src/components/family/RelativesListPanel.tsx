import type { RefObject } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, FlatList } from 'react-native';

import { FamilyRecentPeopleSection } from '@/components/family/FamilyRecentPeopleSection';
import { FamilySearchResultRow } from '@/components/family/FamilySearchResultRow';
import { RootPersonIdentityBanner } from '@/components/identity/RootPersonIdentityBanner';
import { PresetEmptyState, ErrorState } from '@/components/ui/EmptyState';
import { OnboardingHintsCard } from '@/components/ui/OnboardingHintsCard';
import { CALM_UX } from '@/constants/calm-ux';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { FAMILY_SEARCH_COPY } from '@/constants/family-search-content';
import { FilterChips } from '@/components/ui/FilterChips';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RelativeListCard } from '@/components/ui/RelativeListCard';
import { SearchField } from '@/components/ui/SearchField';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useKinshipAnchor } from '@/hooks/useKinshipAnchor';
import { useRecentPeople } from '@/hooks/useRecentPeople';
import { useRelativesListPreparedView } from '@/hooks/useShezhirePreparedView';
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
  const anchorPerson = useKinshipAnchor();
  const { kinshipLabels } = useRelativesListPreparedView();
  const { recentPeople, refreshRecent } = useRecentPeople();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RelativeFilter>('all');
  const listOffsetRef = useRef(0);
  const itemOffsetsRef = useRef<Record<string, number>>({});

  const isSearching = searchQuery.trim().length > 0;

  const searchContext = useMemo(
    () => ({
      anchorPerson,
      allRelatives: relatives,
      kinshipLabels,
    }),
    [anchorPerson, kinshipLabels, relatives],
  );

  useEffect(() => {
    if (!highlightId) {
      return;
    }

    setSearchQuery('');
    setActiveFilter('all');
  }, [highlightId]);

  useFocusEffect(
    useCallback(() => {
      void refreshRecent();
    }, [refreshRecent]),
  );

  const filteredRelatives = useMemo(
    () => filterRelatives(relatives, searchQuery, activeFilter, new Date(), searchContext),
    [relatives, searchQuery, activeFilter, searchContext],
  );

  const virtualizeThreshold = CALM_UX.performance.virtualizeListThreshold;
  const shouldVirtualizeList = filteredRelatives.length >= virtualizeThreshold;

  const openRelativeProfile = useCallback(
    (relativeId: string) => {
      router.push({
        pathname: '/relative/[id]',
        params: { id: relativeId },
      });
    },
    [router],
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
        <PresetEmptyState
          preset={EMPTY_STATE_PRESETS.relatives}
          onAction={() => router.push('/add-relative')}
        />
        <OnboardingHintsCard />
      </View>
    );
  }

  return (
    <>
      <RootPersonIdentityBanner />

      <SectionTitle
        title={isSearching ? FAMILY_SEARCH_COPY.resultsTitle : FAMILY_SEARCH_COPY.allTitle}
        subtitle={isSearching ? undefined : FAMILY_SEARCH_COPY.allHint}
      />

      <SearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={FAMILY_SEARCH_COPY.placeholder}
      />

      {!isSearching ? (
        <>
          <FamilyRecentPeopleSection
            people={recentPeople}
            kinshipLabels={kinshipLabels}
            onOpenRelative={openRelativeProfile}
          />

          <FilterChips options={RELATIVE_FILTERS} value={activeFilter} onChange={setActiveFilter} />
        </>
      ) : null}

      {filteredRelatives.length === 0 ? (
        <View style={styles.noResults}>
          <Text style={styles.noResultsTitle}>{FAMILY_SEARCH_COPY.noResultsTitle}</Text>
          <Text style={styles.noResultsText}>{FAMILY_SEARCH_COPY.noResultsHint}</Text>
          <PrimaryButton
            label={FAMILY_SEARCH_COPY.reset}
            variant="gold"
            onPress={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
          />
        </View>
      ) : isSearching ? (
        <View style={styles.compactList}>
          {filteredRelatives.map((relative) => (
            <FamilySearchResultRow
              key={relative.id}
              relative={relative}
              kinshipLabel={kinshipLabels.get(relative.id)}
              highlighted={relative.id === highlightId}
              onPress={() => openRelativeProfile(relative.id)}
            />
          ))}
        </View>
      ) : (
        <View
          style={styles.list}
          onLayout={(event) => {
            listOffsetRef.current = event.nativeEvent.layout.y;
          }}>
          {shouldVirtualizeList ? (
            <FlatList
              data={filteredRelatives}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item: relative }) => (
                <View
                  onLayout={(event) => {
                    itemOffsetsRef.current[relative.id] = event.nativeEvent.layout.y;
                  }}>
                  <RelativeListCard
                    relative={relative}
                    highlighted={relative.id === highlightId}
                    kinshipLabel={kinshipLabels.get(relative.id)}
                  />
                </View>
              )}
            />
          ) : (
            filteredRelatives.map((relative) => (
              <View
                key={relative.id}
                onLayout={(event) => {
                  itemOffsetsRef.current[relative.id] = event.nativeEvent.layout.y;
                }}>
                <RelativeListCard
                  relative={relative}
                  highlighted={relative.id === highlightId}
                  kinshipLabel={kinshipLabels.get(relative.id)}
                />
              </View>
            ))
          )}
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
  compactList: {
    gap: Spacing.sm,
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
    lineHeight: 22,
  },
});
