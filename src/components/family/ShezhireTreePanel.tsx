import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, UIManager, View } from 'react-native';

import { FocusedShezhireTree } from '@/components/shezhire/FocusedShezhireTree';
import { UserIdentityPromptBanner } from '@/components/identity/UserIdentityPromptBanner';
import { UnlinkedRelativeCard } from '@/components/shezhire/UnlinkedRelativeCard';
import { ShezhireHelperBanner } from '@/components/shezhire/ShezhireHelperBanner';
import { PresetEmptyState } from '@/components/ui/EmptyState';
import { HelperHintBanner } from '@/components/ui/HelperHintBanner';
import { EMPTY_STATE_PRESETS, SHEZHIRE_FOCUSED_ROOT } from '@/constants/family-ux-content';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { Relative } from '@/types/relative';
import { buildEditRelativeHref } from '@/utils/edit-relative-navigation';
import { buildFamilyTree } from '@/utils/family-tree';
import {
  buildFocusedFamilyTree,
  getFocusedTreeRelativeIds,
  hasShezhireLinks,
  pickDefaultRootId,
} from '@/utils/focused-family-tree';
import { getEffectiveSpouse } from '@/utils/relationship-engine';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  appendFocusCrumb,
  createFocusCrumb,
  truncateFocusCrumbs,
  type ShezhireFocusCrumb,
} from '@/utils/shezhire-focus-navigation';
import type { ParentSideSiblingAddParams } from '@/utils/parent-side-sibling-add';
import { findRelativeByLinkId, relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { getKinshipCardLine } from '@/utils/kinship/getKinshipLabel';
import {
  buildParentSideRelativesTree,
  getParentSideRelativeIds,
} from '@/utils/parent-side-relatives';
import {
  analyzeUnlinkedRelative,
  type UnlinkedRelativeActionId,
} from '@/utils/unlinked-relative-ux';
import { MaxContentWidth, Spacing } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FOCUS_ANIMATION = LayoutAnimation.create(
  320,
  LayoutAnimation.Types.easeInEaseOut,
  LayoutAnimation.Properties.opacity,
);

type ShezhireTreePanelProps = {
  relatives: Relative[];
  isEmpty: boolean;
  relativesRevision: number;
  getRelativeById: (relativeId: string) => Relative | null;
  refreshing: boolean;
  onRefresh: () => void;
};

function buildInitialCrumb(relativeId: string, relatives: Relative[]): ShezhireFocusCrumb {
  const relative = findRelativeByLinkId(relatives, relativeId);
  const label = relative ? getRelativeDisplayName(relative) : 'Орталық';

  return createFocusCrumb(relativeId, label);
}

export function ShezhireTreePanel({
  relatives,
  isEmpty,
  relativesRevision,
  getRelativeById,
  refreshing,
  onRefresh,
}: ShezhireTreePanelProps) {
  const router = useRouter();
  const [rootId, setRootId] = useState<string | null>(null);
  const [focusCrumbs, setFocusCrumbs] = useState<ShezhireFocusCrumb[]>([]);

  const resolveRelative = useCallback(
    (relative: Relative) => getRelativeById(relative.id) ?? relative,
    [getRelativeById],
  );

  const { myRelativeId, myRelative } = useUserIdentity();

  const defaultRootId = useMemo(
    () => pickDefaultRootId(relatives, myRelativeId),
    [myRelativeId, relatives],
  );
  const treeBuilt = hasShezhireLinks(relatives);

  const focusedTree = useMemo(() => {
    if (!rootId) {
      return null;
    }

    return buildFocusedFamilyTree(rootId, relatives);
  }, [relatives, rootId]);

  const focusedTreeExcludeIds = useMemo(() => {
    if (!focusedTree) {
      return new Set<string>();
    }

    return getFocusedTreeRelativeIds(focusedTree);
  }, [focusedTree]);

  const treeRootPerson = useMemo(
    () => (rootId ? findRelativeByLinkId(relatives, rootId) : null),
    [relatives, rootId],
  );

  const parentSideTree = useMemo(() => {
    if (!treeRootPerson || !focusedTree) {
      return null;
    }

    return buildParentSideRelativesTree(treeRootPerson, relatives, focusedTreeExcludeIds);
  }, [focusedTree, focusedTreeExcludeIds, relatives, treeRootPerson]);

  const unlinked = useMemo(() => {
    const base = buildFamilyTree(relatives).unlinked;
    if (!focusedTree || !rootId) {
      return base;
    }

    const excludeIds = new Set(focusedTreeExcludeIds);
    const rootPerson = findRelativeByLinkId(relatives, rootId);
    const spouse = rootPerson ? getEffectiveSpouse(rootPerson, relatives) : null;

    if (spouse) {
      excludeIds.add(spouse.id);
    }

    if (parentSideTree) {
      for (const id of getParentSideRelativeIds(parentSideTree)) {
        excludeIds.add(id);
      }
    }

    return base.filter(
      (relative) =>
        ![...excludeIds].some((excludedId) => relativeLinkIdsMatch(relative.id, excludedId)),
    );
  }, [focusedTree, focusedTreeExcludeIds, parentSideTree, relatives, rootId]);

  useEffect(() => {
    if (!defaultRootId) {
      setRootId(null);
      setFocusCrumbs([]);
      return;
    }

    setRootId((current) => {
      if (!current || !relatives.some((relative) => relativeLinkIdsMatch(relative.id, current))) {
        return defaultRootId;
      }

      return current;
    });
  }, [defaultRootId, relatives]);

  useEffect(() => {
    if (!rootId) {
      return;
    }

    const relative = getRelativeById(rootId);
    const label = relative ? getRelativeDisplayName(relative) : 'Орталық';

    setFocusCrumbs((current) => {
      if (current.length === 0) {
        return [createFocusCrumb(rootId, label)];
      }

      return appendFocusCrumb(current, rootId, label);
    });
  }, [getRelativeById, rootId]);

  const animateFocusChange = useCallback(() => {
    LayoutAnimation.configureNext(FOCUS_ANIMATION);
  }, []);

  const handleSelectRoot = useCallback(
    (id: string) => {
      setRootId((current) => {
        if (id === current) {
          return current;
        }

        animateFocusChange();
        return id;
      });
    },
    [animateFocusChange],
  );

  const handleBreadcrumbSelect = useCallback(
    (id: string) => {
      animateFocusChange();
      setRootId(id);
      setFocusCrumbs((current) => truncateFocusCrumbs(current, id));
    },
    [animateFocusChange],
  );

  const handleBackToMyTree = useCallback(() => {
    if (!defaultRootId) {
      return;
    }

    animateFocusChange();
    setRootId(defaultRootId);
    setFocusCrumbs([buildInitialCrumb(defaultRootId, relatives)]);
  }, [animateFocusChange, defaultRootId, relatives]);

  const openConnect = (id: string) => {
    router.push({
      pathname: '/connect-relative/[id]',
      params: { id },
    });
  };

  const openAddChild = (params: { fatherId?: string; motherId?: string }) => {
    router.push({
      pathname: '/add-relative',
      params: {
        ...(params.fatherId ? { fatherId: params.fatherId } : {}),
        ...(params.motherId ? { motherId: params.motherId } : {}),
        ...(rootId ? { rootId } : {}),
      },
    });
  };

  const openAddParentSideSibling = (params: ParentSideSiblingAddParams) => {
    router.push({
      pathname: '/add-relative',
      params: {
        fatherId: params.fatherId,
        motherId: params.motherId,
        relationship: params.relationship,
        rootId: params.rootId,
      },
    });
  };

  const openEdit = (id: string) => {
    router.push(buildEditRelativeHref(id, 'shezhire'));
  };

  const handleUnlinkedAction = (relativeId: string, actionId: UnlinkedRelativeActionId) => {
    if (actionId === 'focus_tree') {
      handleSelectRoot(relativeId);
      return;
    }

    if (actionId === 'link_parents') {
      openConnect(relativeId);
      return;
    }

    openEdit(relativeId);
  };

  if (isEmpty) {
    return (
      <View style={styles.emptyWrap}>
        <PresetEmptyState preset={EMPTY_STATE_PRESETS.familyTree} />
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <UserIdentityPromptBanner compact />
      <ShezhireHelperBanner />

      <PrimaryButton
        label={refreshing ? 'Жаңартылуда...' : 'Жаңарту'}
        sublabel="Деректерді қайта жүктеу"
        variant="gold"
        onPress={refreshing ? undefined : onRefresh}
      />

      <PrimaryButton
        label="Туыстықты анықтау"
        sublabel="Екі туыс арасындағы байланыс"
        variant="gold"
        onPress={() => router.push('/relationship')}
      />

      {treeBuilt && focusedTree ? (
        <FocusedShezhireTree
          key={`${String(relativesRevision)}:${focusedTree.root.id}`}
          tree={focusedTree}
          relatives={relatives}
          focusCrumbs={focusCrumbs}
          myTreeRootId={defaultRootId}
          resolveRelative={resolveRelative}
          lookupRelativeById={getRelativeById}
          onSelectRoot={handleSelectRoot}
          onBreadcrumbSelect={handleBreadcrumbSelect}
          onBackToMyTree={handleBackToMyTree}
          onEditRelative={openEdit}
          onAddChild={openAddChild}
          onAddParentSideSibling={openAddParentSideSibling}
        />
      ) : (
        <PresetEmptyState preset={EMPTY_STATE_PRESETS.familyTreePartial} />
      )}

      {unlinked.length > 0 ? (
        <View style={styles.section}>
          <SectionTitle
            title={SHEZHIRE_FOCUSED_ROOT.unlinkedSection.title}
            subtitle={SHEZHIRE_FOCUSED_ROOT.unlinkedSection.subtitle}
          />
          <HelperHintBanner
            icon="🌿"
            text={SHEZHIRE_FOCUSED_ROOT.unlinkedSection.helper}
            subtext={SHEZHIRE_FOCUSED_ROOT.unlinkedSection.cardHint}
            tone="cream"
          />
          <View style={styles.unlinkedList}>
            {unlinked.map((relative) => {
              const freshRelative = resolveRelative(relative);
              const kinshipRoot = treeRootPerson ?? myRelative;
              const kinshipLine =
                kinshipRoot && freshRelative
                  ? getKinshipCardLine(kinshipRoot, freshRelative, relatives)
                  : undefined;
              const insight = analyzeUnlinkedRelative(freshRelative, relatives);

              return (
                <UnlinkedRelativeCard
                  key={`${freshRelative.id}:${getRelativeDisplayName(freshRelative)}`}
                  relative={freshRelative}
                  insight={insight}
                  kinshipLine={kinshipLine}
                  onAction={(actionId) => handleUnlinkedAction(freshRelative.id, actionId)}
                />
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    gap: Spacing.lg,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  emptyWrap: {
    paddingVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.md,
  },
  unlinkedList: {
    gap: Spacing.sm,
  },
});
