import { useMemo, memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  FamilyTreeCard,
  getCompactChildrenLayout,
} from '@/components/shezhire/FamilyTreeCard';
import { JurtRelativesPanel } from '@/components/shezhire/JurtRelativesPanel';
import { ShezhireFocusBreadcrumb } from '@/components/shezhire/ShezhireFocusBreadcrumb';
import { Card } from '@/components/ui/Card';
import { FadeTransition } from '@/components/ui/motion/FadeTransition';
import { SHEZHIRE_FOCUSED_ROOT, SHEZHIRE_JURT } from '@/constants/family-ux-content';
import { buildPreparedKinshipCardProps } from '@/services/shezhire-view.service';
import type { ShezhireTreePreparedView, KinshipLabelMap } from '@/services/shezhire-view.types';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { resolveShezhireRootPerson, resolveShezhireParentSlots } from '@/utils/shezhire-parent-lookup';
import { ShezhireFocusCrumb } from '@/utils/shezhire-focus-navigation';
import { Relative } from '@/types/relative';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type FocusedShezhireTreeProps = {
  preparedView: ShezhireTreePreparedView;
  relatives: Relative[];
  focusCrumbs?: ShezhireFocusCrumb[];
  myTreeRootId?: string | null;
  resolveRelative?: (relative: Relative) => Relative;
  onSelectRoot: (relativeId: string) => void;
  onBreadcrumbSelect?: (relativeId: string) => void;
  onBackToMyTree?: () => void;
  onEditRelative: (relativeId: string) => void;
};

type GenerationSection = 'parents' | 'peers' | 'core' | 'spouse' | 'children' | 'jurt';

type TreeSectionProps = {
  label: string;
  generation: GenerationSection;
  children: ReactNode;
};

type KinshipCardPropsFn = (relative: Relative) => { kinshipLine: string };

function createKinshipCardProps(
  rootPerson: Relative,
  kinshipLabels: KinshipLabelMap,
): KinshipCardPropsFn {
  return (relative: Relative) =>
    buildPreparedKinshipCardProps(kinshipLabels, rootPerson, relative);
}

function TreeSection({ label, generation, children }: TreeSectionProps) {
  return (
    <View style={[styles.section, styles[`section_${generation}`]]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, generation === 'core' && styles.sectionLabelCore]}>
          {label}
        </Text>
      </View>
      {children}
    </View>
  );
}

function TreeNavigation({
  showBackButton,
  onBackToMyTree,
  focusCrumbs,
  activeRootId,
  onBreadcrumbSelect,
}: {
  showBackButton: boolean;
  onBackToMyTree?: () => void;
  focusCrumbs: ShezhireFocusCrumb[];
  activeRootId: string;
  onBreadcrumbSelect?: (relativeId: string) => void;
}) {
  if (!showBackButton && focusCrumbs.length <= 1) {
    return null;
  }

  return (
    <View style={styles.navRow}>
      {showBackButton && onBackToMyTree ? (
        <Pressable
          onPress={onBackToMyTree}
          style={({ pressed }) => [styles.backToMyTreeButton, pressed && styles.backToMyTreePressed]}
          accessibilityRole="button"
          accessibilityLabel={SHEZHIRE_FOCUSED_ROOT.backToMyTree}>
          <Text style={styles.backToMyTreeText}>{SHEZHIRE_FOCUSED_ROOT.backToMyTree}</Text>
        </Pressable>
      ) : null}
      {focusCrumbs.length > 1 && onBreadcrumbSelect ? (
        <ShezhireFocusBreadcrumb
          crumbs={focusCrumbs}
          activeRootId={activeRootId}
          onSelect={onBreadcrumbSelect}
        />
      ) : null}
    </View>
  );
}

function ParentSlotCard({
  relative,
  kinshipCardProps,
  onSelectRoot,
  onEditRelative,
}: {
  relative: Relative | null;
  kinshipCardProps: KinshipCardPropsFn;
  onSelectRoot: (id: string) => void;
  onEditRelative: (id: string) => void;
}) {
  if (!relative) {
    return (
      <FamilyTreeCard
        placeholder
        placeholderLabel="—"
        visualTier="parent"
        compact
        mini
      />
    );
  }

  return (
    <FamilyTreeCard
      key={`${relative.id}:${getRelativeDisplayName(relative)}`}
      relative={relative}
      visualTier="parent"
      compact
      mini
      hideRelationship
      {...kinshipCardProps(relative)}
      onPress={() => onSelectRoot(relative.id)}
      onLongPress={() => onEditRelative(relative.id)}
    />
  );
}

function ParentSlotsRow({
  father,
  mother,
  kinshipCardProps,
  onSelectRoot,
  onEditRelative,
}: {
  father: Relative | null;
  mother: Relative | null;
  kinshipCardProps: KinshipCardPropsFn;
  onSelectRoot: (id: string) => void;
  onEditRelative: (id: string) => void;
}) {
  return (
    <View style={styles.parentRow}>
      <View style={styles.parentCardWrap}>
        <ParentSlotCard
          relative={father}
          kinshipCardProps={kinshipCardProps}
          onSelectRoot={onSelectRoot}
          onEditRelative={onEditRelative}
        />
      </View>

      <View style={styles.parentLink}>
        <Text style={styles.parentLinkIcon}>♥</Text>
      </View>

      <View style={styles.parentCardWrap}>
        <ParentSlotCard
          relative={mother}
          kinshipCardProps={kinshipCardProps}
          onSelectRoot={onSelectRoot}
          onEditRelative={onEditRelative}
        />
      </View>
    </View>
  );
}

function CorePersonCard({
  root,
  kinshipCardProps,
  onSelectRoot,
  onEditRelative,
}: {
  root: Relative;
  kinshipCardProps: KinshipCardPropsFn;
  onSelectRoot: (id: string) => void;
  onEditRelative: (id: string) => void;
}) {
  return (
    <View style={styles.coreSingleWrap}>
      <FamilyTreeCard
        relative={root}
        visualTier="core"
        compact
        highlighted
        hideRelationship
        {...kinshipCardProps(root)}
        onPress={() => onSelectRoot(root.id)}
        onLongPress={() => onEditRelative(root.id)}
      />
    </View>
  );
}

export const FocusedShezhireTree = memo(function FocusedShezhireTree({
  preparedView,
  relatives,
  focusCrumbs = [],
  myTreeRootId = null,
  resolveRelative = (relative) => relative,
  onSelectRoot,
  onBreadcrumbSelect,
  onBackToMyTree,
  onEditRelative,
}: FocusedShezhireTreeProps) {
  const { rootGraph, threeJurtGroups, kinshipLabels } = preparedView;
  const { root, siblings, spouse } = rootGraph;
  const rootPerson = useMemo(
    () => resolveShezhireRootPerson(root, relatives),
    [relatives, root],
  );
  const freshRoot = rootPerson ? resolveRelative(rootPerson) : resolveRelative(root);

  const treeChildren = rootGraph.children;

  const resolvedParentSlots = useMemo(
    () => resolveShezhireParentSlots(freshRoot, relatives),
    [freshRoot, relatives],
  );

  const freshSpouse = spouse ? resolveRelative(spouse) : null;
  const isMyTree = Boolean(myTreeRootId && freshRoot.id === myTreeRootId);
  const showBackToMyTree = Boolean(myTreeRootId && !isMyTree && onBackToMyTree);
  const childLayout = getCompactChildrenLayout(treeChildren.length);
  const siblingLayout = getCompactChildrenLayout(siblings.length);
  const freshSiblings = siblings.map((sibling) => resolveRelative(sibling));
  const kinshipCardProps = useMemo(
    () => createKinshipCardProps(freshRoot, kinshipLabels),
    [freshRoot, kinshipLabels],
  );

  const resolvedChildren = useMemo(
    () => treeChildren.map((child) => resolveRelative(child)),
    [resolveRelative, treeChildren],
  );

  return (
    <FadeTransition transitionKey={freshRoot.id} style={styles.wrap}>
      <Card goldBorder style={styles.treeCard}>
        <TreeNavigation
          showBackButton={showBackToMyTree}
          onBackToMyTree={onBackToMyTree}
          focusCrumbs={focusCrumbs}
          activeRootId={freshRoot.id}
          onBreadcrumbSelect={onBreadcrumbSelect}
        />

        <TreeSection generation="core" label={SHEZHIRE_FOCUSED_ROOT.sections.coreFamily}>
          <CorePersonCard
            root={freshRoot}
            kinshipCardProps={kinshipCardProps}
            onSelectRoot={onSelectRoot}
            onEditRelative={onEditRelative}
          />
        </TreeSection>

        <TreeSection generation="parents" label={SHEZHIRE_FOCUSED_ROOT.sections.parents}>
          <ParentSlotsRow
            father={
              resolvedParentSlots.father.parent
                ? resolveRelative(resolvedParentSlots.father.parent)
                : null
            }
            mother={
              resolvedParentSlots.mother.parent
                ? resolveRelative(resolvedParentSlots.mother.parent)
                : null
            }
            kinshipCardProps={kinshipCardProps}
            onSelectRoot={onSelectRoot}
            onEditRelative={onEditRelative}
          />
        </TreeSection>

        {freshSpouse ? (
          <TreeSection generation="spouse" label={SHEZHIRE_FOCUSED_ROOT.sections.spouse}>
            <FamilyTreeCard
              relative={freshSpouse}
              visualTier="peer"
              compact
              hideRelationship
              {...kinshipCardProps(freshSpouse)}
              onPress={() => onSelectRoot(freshSpouse.id)}
              onLongPress={() => onEditRelative(freshSpouse.id)}
            />
          </TreeSection>
        ) : null}

        {resolvedChildren.length > 0 ? (
          <TreeSection generation="children" label={SHEZHIRE_FOCUSED_ROOT.sections.children}>
            <View style={[styles.childrenRow, childLayout.compact && styles.childrenRowCompact]}>
              {resolvedChildren.map((child) => (
                <FamilyTreeCard
                  key={`${child.id}:${getRelativeDisplayName(child)}`}
                  relative={child}
                  visualTier="child"
                  compact
                  mini={childLayout.mini}
                  gridItem={childLayout.gridItem}
                  hideRelationship
                  {...kinshipCardProps(child)}
                  onPress={() => onSelectRoot(child.id)}
                  onLongPress={() => onEditRelative(child.id)}
                />
              ))}
            </View>
          </TreeSection>
        ) : null}

        {freshSiblings.length > 0 ? (
          <TreeSection generation="peers" label={SHEZHIRE_FOCUSED_ROOT.sections.siblings}>
            <View style={[styles.childrenRow, siblingLayout.compact && styles.childrenRowCompact]}>
              {freshSiblings.map((sibling) => (
                <FamilyTreeCard
                  key={`${sibling.id}:${getRelativeDisplayName(sibling)}`}
                  relative={sibling}
                  visualTier="peer"
                  compact
                  mini={siblingLayout.mini}
                  gridItem={siblingLayout.gridItem}
                  hideRelationship
                  {...kinshipCardProps(sibling)}
                  onPress={() => onSelectRoot(sibling.id)}
                  onLongPress={() => onEditRelative(sibling.id)}
                />
              ))}
            </View>
          </TreeSection>
        ) : null}

        <TreeSection generation="jurt" label={SHEZHIRE_JURT.sectionTitle}>
          <JurtRelativesPanel
            rootPerson={freshRoot}
            relatives={relatives}
            threeJurtGroups={threeJurtGroups}
            kinshipLabels={kinshipLabels}
            resolveRelative={resolveRelative}
            onSelectRoot={onSelectRoot}
            onEditRelative={onEditRelative}
          />
        </TreeSection>
      </Card>
    </FadeTransition>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.lg,
  },
  treeCard: {
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#FBF9F4',
  },
  navRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0D0',
  },
  backToMyTreeButton: {
    marginTop: Spacing.xs,
    minHeight: 42,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    alignSelf: 'stretch',
  },
  backToMyTreePressed: {
    opacity: 0.9,
    backgroundColor: '#F7F4EE',
  },
  backToMyTreeText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 2,
    borderWidth: 1,
  },
  section_parents: {
    backgroundColor: '#F5F1E8',
    borderColor: '#E8E0D0',
    paddingVertical: Spacing.xs,
  },
  section_peers: {
    backgroundColor: '#F8F6F0',
    borderColor: '#ECE6DA',
  },
  section_core: {
    backgroundColor: Palette.white,
    borderColor: Palette.greenDeep,
    borderWidth: 1.5,
    paddingVertical: Spacing.md,
    shadowColor: '#2C4A3E',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  section_spouse: {
    backgroundColor: '#F8F6F0',
    borderColor: '#ECE6DA',
  },
  section_children: {
    backgroundColor: '#FAFAF7',
    borderColor: '#ECE6DA',
  },
  section_jurt: {
    backgroundColor: '#F8F6F0',
    borderColor: '#ECE6DA',
  },
  sectionHeader: {
    gap: 2,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    opacity: 0.92,
  },
  sectionLabelCore: {
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    opacity: 0.92,
  },
  parentCardWrap: {
    flex: 1,
    minWidth: 0,
    transform: [{ scale: 0.94 }],
  },
  parentLink: {
    alignSelf: 'center',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F0EBE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentLinkIcon: {
    fontSize: 10,
    color: Palette.gold,
  },
  coreSingleWrap: {
    alignItems: 'center',
    gap: Spacing.xs,
    width: '100%',
    maxWidth: 240,
    alignSelf: 'center',
  },
  childrenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  childrenRowCompact: {
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
});
