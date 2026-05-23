import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { FamilyTreeCard } from '@/components/shezhire/FamilyTreeCard';
import { SHEZHIRE_FOCUSED_ROOT } from '@/constants/family-ux-content';
import type { Relative } from '@/types/relative';
import { getKinshipCardLine } from '@/utils/kinship/getKinshipLabel';
import {
  countParentSideRelatives,
  type ParentSideBranch,
  type ParentSideRelativeEntry,
  type ParentSideRelativesTree,
} from '@/utils/parent-side-relatives';
import { getRelativeDisplayName } from '@/utils/relative-names';
import {
  buildParentSideSiblingAddAction,
  type ParentSideSiblingAddParams,
} from '@/utils/parent-side-sibling-add';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type ParentSideRelativesPanelProps = {
  rootPerson: Relative;
  relatives: Relative[];
  tree: ParentSideRelativesTree;
  resolveRelative: (relative: Relative) => Relative;
  onSelectRoot: (relativeId: string) => void;
  onEditRelative: (relativeId: string) => void;
  onAddParentSideSibling: (params: ParentSideSiblingAddParams) => void;
  onShowKinshipDetail?: (relative: Relative) => void;
};

function buildKinshipCardProps(
  rootPerson: Relative,
  relative: Relative,
  relatives: Relative[],
  onShowKinshipDetail?: (relative: Relative) => void,
): { kinshipLine: string; onKinshipPress?: () => void } {
  return {
    kinshipLine: getKinshipCardLine(rootPerson, relative, relatives),
    onKinshipPress: onShowKinshipDetail ? () => onShowKinshipDetail(relative) : undefined,
  };
}

function CollapsibleSideSection({
  branch,
  title,
  subtitle,
  rootPerson,
  relatives,
  resolveRelative,
  onSelectRoot,
  onEditRelative,
  onAddParentSideSibling,
  onShowKinshipDetail,
}: {
  branch: ParentSideBranch;
  title: string;
  subtitle: string;
  rootPerson: Relative;
  relatives: Relative[];
  resolveRelative: (relative: Relative) => Relative;
  onSelectRoot: (relativeId: string) => void;
  onEditRelative: (relativeId: string) => void;
  onAddParentSideSibling: (params: ParentSideSiblingAddParams) => void;
  onShowKinshipDetail?: (relative: Relative) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const relativeCount = countParentSideRelatives(branch);
  const copy = SHEZHIRE_FOCUSED_ROOT.parentSide;
  const addAction = useMemo(
    () =>
      buildParentSideSiblingAddAction(
        branch.side === 'father' ? 'father' : 'mother',
        rootPerson,
        relatives,
      ),
    [branch.side, relatives, rootPerson],
  );

  const handleAddSibling = () => {
    if (!addAction.canAdd || !addAction.addParams) {
      Alert.alert('', addAction.blockedMessage ?? copy.fatherMissing);
      return;
    }

    onAddParentSideSibling(addAction.addParams);
  };

  useEffect(() => {
    setExpanded(false);
  }, [rootPerson.id]);

  const emptyMessage =
    branch.guidanceMessage ??
    (branch.grandparentsReady && branch.entries.length === 0
      ? branch.side === 'father'
        ? copy.fatherEmpty
        : copy.motherEmpty
      : null);

  return (
    <View style={styles.sideSection}>
      <Pressable
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.sideToggle, pressed && styles.sideTogglePressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}>
        <View style={styles.sideHeader}>
          <Text style={styles.sideTitle}>{title}</Text>
          <Text style={styles.sideSubtitle}>{subtitle}</Text>
          {relativeCount > 0 ? (
            <Text style={styles.sideCount}>{copy.relativesCount(relativeCount)}</Text>
          ) : null}
        </View>
        <Text style={styles.collapseIcon}>{expanded ? '▾' : '▸'}</Text>
      </Pressable>

      <Pressable
        onPress={handleAddSibling}
        style={({ pressed }) => [styles.addSiblingButton, pressed && styles.addSiblingPressed]}
        accessibilityRole="button"
        accessibilityLabel={addAction.buttonLabel}>
        <Text style={styles.addSiblingIcon}>+</Text>
        <Text style={styles.addSiblingText}>{addAction.buttonLabel}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.sideBody}>
          {emptyMessage ? (
            <Text style={styles.emptyLine}>{emptyMessage}</Text>
          ) : (
            branch.entries.map((entry) => (
              <ParentSideRelativeEntryCard
                key={entry.person.id}
                entry={entry}
                rootPerson={rootPerson}
                relatives={relatives}
                resolveRelative={resolveRelative}
                onSelectRoot={onSelectRoot}
                onEditRelative={onEditRelative}
                onShowKinshipDetail={onShowKinshipDetail}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

function ParentSideRelativeEntryCard({
  entry,
  rootPerson,
  relatives,
  resolveRelative,
  onSelectRoot,
  onEditRelative,
  onShowKinshipDetail,
}: {
  entry: ParentSideRelativeEntry;
  rootPerson: Relative;
  relatives: Relative[];
  resolveRelative: (relative: Relative) => Relative;
  onSelectRoot: (relativeId: string) => void;
  onEditRelative: (relativeId: string) => void;
  onShowKinshipDetail?: (relative: Relative) => void;
}) {
  const [childrenExpanded, setChildrenExpanded] = useState(false);
  const person = resolveRelative(entry.person);
  const children = entry.children.map((child) => resolveRelative(child));
  const copy = SHEZHIRE_FOCUSED_ROOT.parentSide;

  return (
    <View style={styles.entryCard}>
      <FamilyTreeCard
        relative={person}
        visualTier="peer"
        compact
        {...buildKinshipCardProps(rootPerson, person, relatives, onShowKinshipDetail)}
        onPress={() => onSelectRoot(person.id)}
        onLongPress={() => onEditRelative(person.id)}
      />

      {children.length > 0 ? (
        <View style={styles.entryChildrenBlock}>
          <Pressable
            onPress={() => setChildrenExpanded((current) => !current)}
            style={({ pressed }) => [
              styles.childrenToggle,
              pressed && styles.childrenTogglePressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ expanded: childrenExpanded }}>
            <Text style={styles.childrenToggleText}>
              {childrenExpanded ? copy.collapseChildren : copy.expandChildren}
            </Text>
            <Text style={styles.childrenToggleMeta}>
              {copy.childrenCount(children.length)} · {getRelativeDisplayName(person)}
            </Text>
            <Text style={styles.collapseIcon}>{childrenExpanded ? '▾' : '▸'}</Text>
          </Pressable>

          {childrenExpanded ? (
            <View style={styles.childrenRow}>
              {children.map((child) => (
                <FamilyTreeCard
                  key={`${child.id}:${getRelativeDisplayName(child)}`}
                  relative={child}
                  visualTier="child"
                  compact
                  mini
                  gridItem
                  {...buildKinshipCardProps(rootPerson, child, relatives, onShowKinshipDetail)}
                  onPress={() => onSelectRoot(child.id)}
                  onLongPress={() => onEditRelative(child.id)}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function ParentSideRelativesPanel({
  rootPerson,
  relatives,
  tree,
  resolveRelative,
  onSelectRoot,
  onEditRelative,
  onAddParentSideSibling,
  onShowKinshipDetail,
}: ParentSideRelativesPanelProps) {
  const copy = SHEZHIRE_FOCUSED_ROOT.parentSide;

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Туыс жақтар · Extended family</Text>
      <Text style={styles.panelHint}>{copy.kinshipAutoCalculated}</Text>
      <Text style={styles.panelMeta}>
        Орталық тұлға: {getRelativeDisplayName(rootPerson)} · labels from current root
      </Text>

      <CollapsibleSideSection
        branch={tree.fatherSide}
        title={SHEZHIRE_FOCUSED_ROOT.sections.fatherSide}
        subtitle={copy.fatherSubtitle}
        rootPerson={rootPerson}
        relatives={relatives}
        resolveRelative={resolveRelative}
        onSelectRoot={onSelectRoot}
        onEditRelative={onEditRelative}
        onAddParentSideSibling={onAddParentSideSibling}
        onShowKinshipDetail={onShowKinshipDetail}
      />

      <View style={styles.sectionDivider} />

      <CollapsibleSideSection
        branch={tree.motherSide}
        title={SHEZHIRE_FOCUSED_ROOT.sections.motherSide}
        subtitle={copy.motherSubtitle}
        rootPerson={rootPerson}
        relatives={relatives}
        resolveRelative={resolveRelative}
        onSelectRoot={onSelectRoot}
        onEditRelative={onEditRelative}
        onAddParentSideSibling={onAddParentSideSibling}
        onShowKinshipDetail={onShowKinshipDetail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1.5,
    borderTopColor: '#E8E0D0',
  },
  panelTitle: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '800',
    textAlign: 'center',
  },
  panelHint: {
    ...Typography.caption,
    color: Palette.greenDeep,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '700',
  },
  panelMeta: {
    ...Typography.caption,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  sideSection: {
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E8E0D0',
    backgroundColor: '#F8F6F1',
    padding: Spacing.sm,
  },
  sideToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E8E0D0',
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sideTogglePressed: {
    opacity: 0.92,
  },
  sideHeader: {
    flex: 1,
    gap: 2,
  },
  sideTitle: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  sideSubtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    lineHeight: 18,
  },
  sideCount: {
    ...Typography.caption,
    color: Palette.textMuted,
    marginTop: 2,
  },
  sideBody: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E8E0D0',
  },
  entryCard: {
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#ECE6DA',
    backgroundColor: '#FCFBF8',
    padding: Spacing.sm,
  },
  entryChildrenBlock: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#EEE8DC',
  },
  childrenToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 36,
    paddingHorizontal: Spacing.sm,
  },
  childrenTogglePressed: {
    opacity: 0.92,
  },
  childrenToggleText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  childrenToggleMeta: {
    ...Typography.caption,
    color: Palette.textMuted,
    flex: 1,
  },
  childrenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  collapseIcon: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    minWidth: 18,
    textAlign: 'center',
  },
  emptyLine: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: Spacing.sm,
  },
  addSiblingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 42,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderStyle: 'dashed',
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
  },
  addSiblingPressed: {
    opacity: 0.92,
    backgroundColor: '#F7F4EE',
  },
  addSiblingIcon: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  addSiblingText: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
});
