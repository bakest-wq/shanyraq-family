import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FocusedShezhireTree } from '@/components/shezhire/FocusedShezhireTree';
import { PresetEmptyState } from '@/components/ui/EmptyState';
import { EMPTY_STATE_PRESETS } from '@/constants/family-ux-content';
import { useShezhireRootContext } from '@/providers/ShezhireRootProvider';
import { recordRelativeInteraction } from '@/services/relative-interaction-session';
import { prepareShezhireTreeView } from '@/services/shezhire-view.service';
import { Relative } from '@/types/relative';
import { buildEditRelativeHref } from '@/utils/edit-relative-navigation';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  appendFocusCrumb,
  createFocusCrumb,
  truncateFocusCrumbs,
  type ShezhireFocusCrumb,
} from '@/utils/shezhire-focus-navigation';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type ShezhireTreePanelProps = {
  relatives: Relative[];
  isEmpty: boolean;
  getRelativeById: (relativeId: string) => Relative | null;
  preferredRootId?: string | null;
};

function buildInitialCrumb(relativeId: string, relatives: Relative[]): ShezhireFocusCrumb {
  const relative = relatives.find((entry) => relativeLinkIdsMatch(entry.id, relativeId));
  const label = relative ? getRelativeDisplayName(relative) : 'Орталық';

  return createFocusCrumb(relativeId, label);
}

export function ShezhireTreePanel({
  relatives,
  isEmpty,
  getRelativeById,
  preferredRootId = null,
}: ShezhireTreePanelProps) {
  const router = useRouter();
  const { focusRootId, defaultRootId, setFocusRootId, resetToDefaultRoot } = useShezhireRootContext();
  const [focusCrumbs, setFocusCrumbs] = useState<ShezhireFocusCrumb[]>([]);

  const resolveRelative = useCallback(
    (relative: Relative) => getRelativeById(relative.id) ?? relative,
    [getRelativeById],
  );

  const effectiveRootId = focusRootId ?? defaultRootId;

  const treeRootPerson = useMemo(
    () => (effectiveRootId ? getRelativeById(effectiveRootId) : null),
    [effectiveRootId, getRelativeById],
  );

  const preparedView = useMemo(() => {
    if (!treeRootPerson) {
      return null;
    }

    return prepareShezhireTreeView(treeRootPerson, relatives, { log: false });
  }, [relatives, treeRootPerson]);

  useEffect(() => {
    if (!preferredRootId) {
      return;
    }

    if (!relatives.some((relative) => relativeLinkIdsMatch(relative.id, preferredRootId))) {
      return;
    }

    setFocusRootId(preferredRootId);
    setFocusCrumbs([buildInitialCrumb(preferredRootId, relatives)]);
  }, [preferredRootId, relatives, setFocusRootId]);

  useEffect(() => {
    if (!focusRootId) {
      setFocusCrumbs([]);
      return;
    }

    const relative = getRelativeById(focusRootId);
    const label = relative ? getRelativeDisplayName(relative) : 'Орталық';

    setFocusCrumbs((current) => {
      if (current.length === 0) {
        return [createFocusCrumb(focusRootId, label)];
      }

      return appendFocusCrumb(current, focusRootId, label);
    });
  }, [focusRootId, getRelativeById]);

  const handleSelectRoot = useCallback(
    (id: string) => {
      if (treeRootPerson?.id) {
        recordRelativeInteraction(treeRootPerson.id, id);
      }
      setFocusRootId(id);
    },
    [setFocusRootId, treeRootPerson?.id],
  );

  const handleBreadcrumbSelect = useCallback(
    (id: string) => {
      setFocusRootId(id);
      setFocusCrumbs((current) => truncateFocusCrumbs(current, id));
    },
    [setFocusRootId],
  );

  const handleBackToMyTree = useCallback(() => {
    resetToDefaultRoot();

    if (defaultRootId) {
      setFocusCrumbs([buildInitialCrumb(defaultRootId, relatives)]);
    }
  }, [defaultRootId, relatives, resetToDefaultRoot]);

  const openEdit = useCallback(
    (id: string) => {
      router.push(buildEditRelativeHref(id, 'shezhire'));
    },
    [router],
  );

  if (isEmpty) {
    return (
      <View style={styles.emptyWrap}>
        <PresetEmptyState
          preset={EMPTY_STATE_PRESETS.familyTree}
          onAction={() => router.push('/add-relative')}
        />
      </View>
    );
  }

  return (
    <View style={styles.main}>
      {preparedView ? (
        <FocusedShezhireTree
          preparedView={preparedView}
          relatives={relatives}
          focusCrumbs={focusCrumbs}
          myTreeRootId={defaultRootId}
          resolveRelative={resolveRelative}
          onSelectRoot={handleSelectRoot}
          onBreadcrumbSelect={handleBreadcrumbSelect}
          onBackToMyTree={handleBackToMyTree}
          onEditRelative={openEdit}
        />
      ) : (
        <PresetEmptyState preset={EMPTY_STATE_PRESETS.familyTree} />
      )}
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
});
