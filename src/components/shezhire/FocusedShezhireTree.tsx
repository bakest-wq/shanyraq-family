import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  COMPACT_CHILDREN_THRESHOLD,
  FamilyTreeCard,
  getCompactChildrenLayout,
} from '@/components/shezhire/FamilyTreeCard';
import { KinshipExplanationModal } from '@/components/shezhire/KinshipExplanationModal';
import { ParentSideRelativesPanel } from '@/components/shezhire/ParentSideRelativesPanel';
import { ShezhireFocusBreadcrumb } from '@/components/shezhire/ShezhireFocusBreadcrumb';
import { Card } from '@/components/ui/Card';
import {
  SHEZHIRE_FOCUSED_ROOT,
  SHEZHIRE_SIBLINGS_HELPER,
  formatShezhireFocusedRootTitle,
} from '@/constants/family-ux-content';
import { FocusedFamilyTree, getFocusedAddChildParams, getFocusedTreeRelativeIds } from '@/utils/focused-family-tree';
import { buildParentSideRelativesTree } from '@/utils/parent-side-relatives';
import type { ParentSideSiblingAddParams } from '@/utils/parent-side-sibling-add';
import { getKinshipCardLine } from '@/utils/kinship/getKinshipLabel';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { relativeLinkIdsMatch } from '@/utils/family-link-picker';
import {
  resolveShezhireParentSlots,
  resolveShezhireRootPerson,
  resolveShezhireSpouse,
} from '@/utils/shezhire-parent-lookup';
import { ShezhireFocusCrumb } from '@/utils/shezhire-focus-navigation';
import { Relative } from '@/types/relative';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type FocusedShezhireTreeProps = {
  tree: FocusedFamilyTree;
  relatives: Relative[];
  focusCrumbs?: ShezhireFocusCrumb[];
  myTreeRootId?: string | null;
  resolveRelative?: (relative: Relative) => Relative;
  lookupRelativeById?: (relativeId: string) => Relative | null;
  onSelectRoot: (relativeId: string) => void;
  onBreadcrumbSelect?: (relativeId: string) => void;
  onBackToMyTree?: () => void;
  onEditRelative: (relativeId: string) => void;
  onAddChild: (params: { fatherId?: string; motherId?: string }) => void;
  onAddParentSideSibling: (params: ParentSideSiblingAddParams) => void;
};

type GenerationSection = 'parents' | 'peers' | 'core' | 'children';

type TreeSectionProps = {
  label: string;
  sublabel?: string;
  generation: GenerationSection;
  children: ReactNode;
};

type CollapsibleTreeSectionProps = TreeSectionProps & {
  itemCount: number;
  largeThreshold?: number;
  defaultCollapsed?: boolean;
};

type KinshipCardProps = {
  kinshipLine: string;
  onKinshipPress?: () => void;
};

type KinshipCardPropsFn = (relative: Relative) => KinshipCardProps;

function buildKinshipCardProps(
  rootPerson: Relative,
  relative: Relative,
  relatives: Relative[],
  onShowKinshipDetail?: (relative: Relative) => void,
): KinshipCardProps {
  if (relativeLinkIdsMatch(rootPerson.id, relative.id)) {
    return {
      kinshipLine: 'Орталық тұлға',
    };
  }

  return {
    kinshipLine: getKinshipCardLine(rootPerson, relative, relatives),
    onKinshipPress: onShowKinshipDetail ? () => onShowKinshipDetail(relative) : undefined,
  };
}

function TreeConnector({ subtle = false }: { subtle?: boolean }) {
  return (
    <View style={styles.connector}>
      <View style={[styles.line, subtle && styles.lineSubtle]} />
      <View style={[styles.connectorBadge, subtle && styles.connectorBadgeSubtle]}>
        <Text style={styles.connectorIcon}>↓</Text>
      </View>
      <View style={[styles.line, subtle && styles.lineSubtle]} />
    </View>
  );
}

function TreeSection({ label, sublabel, generation, children }: TreeSectionProps) {
  return (
    <View style={[styles.section, styles[`section_${generation}`]]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, generation === 'core' && styles.sectionLabelCore]}>
          {label}
        </Text>
        {sublabel ? <Text style={styles.sectionSublabel}>{sublabel}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function CollapsibleTreeSection({
  label,
  sublabel,
  generation,
  itemCount,
  largeThreshold = COMPACT_CHILDREN_THRESHOLD,
  defaultCollapsed,
  children,
}: CollapsibleTreeSectionProps) {
  const shouldCollapseByDefault = defaultCollapsed ?? itemCount >= largeThreshold;
  const [collapsed, setCollapsed] = useState(shouldCollapseByDefault);

  useEffect(() => {
    setCollapsed(defaultCollapsed ?? itemCount >= largeThreshold);
  }, [defaultCollapsed, itemCount, largeThreshold]);

  return (
    <View style={[styles.section, styles[`section_${generation}`]]}>
      <Pressable
        onPress={() => setCollapsed((current) => !current)}
        style={({ pressed }) => [styles.sectionToggle, pressed && styles.sectionTogglePressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: !collapsed }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>{label}</Text>
          {sublabel ? <Text style={styles.sectionSublabel}>{sublabel}</Text> : null}
        </View>
        <Text style={styles.collapseIcon}>{collapsed ? '▸' : '▾'}</Text>
      </Pressable>
      {!collapsed ? children : null}
    </View>
  );
}

function FocusedRootHeader({
  fullName,
  showBackButton,
  onBackToMyTree,
}: {
  fullName: string;
  showBackButton: boolean;
  onBackToMyTree?: () => void;
}) {
  return (
    <View style={styles.focusHeader}>
      <Text style={styles.focusTitle}>{formatShezhireFocusedRootTitle(fullName)}</Text>
      <Text style={styles.focusSubtitle}>{SHEZHIRE_FOCUSED_ROOT.contextSubtitle}</Text>
      {showBackButton && onBackToMyTree ? (
        <Pressable
          onPress={onBackToMyTree}
          style={({ pressed }) => [styles.backToMyTreeButton, pressed && styles.backToMyTreePressed]}
          accessibilityRole="button"
          accessibilityLabel={SHEZHIRE_FOCUSED_ROOT.backToMyTree}>
          <Text style={styles.backToMyTreeText}>{SHEZHIRE_FOCUSED_ROOT.backToMyTree}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ParentSlotCard({
  role,
  linkId,
  relative,
  kinshipCardProps,
  onSelectRoot,
  onEditRelative,
}: {
  role: 'father' | 'mother';
  linkId: string | null;
  relative: Relative | null;
  kinshipCardProps: KinshipCardPropsFn;
  onSelectRoot: (id: string) => void;
  onEditRelative: (id: string) => void;
}) {
  if (!linkId) {
    return (
      <FamilyTreeCard
        placeholder
        placeholderLabel={SHEZHIRE_FOCUSED_ROOT.parentUnlinked}
        visualTier="parent"
        compact
        mini
        hideRelationship
      />
    );
  }

  if (!relative) {
    return (
      <FamilyTreeCard
        placeholder
        placeholderLabel={
          role === 'father'
            ? SHEZHIRE_FOCUSED_ROOT.fatherNotFound
            : SHEZHIRE_FOCUSED_ROOT.motherNotFound
        }
        visualTier="parent"
        compact
        mini
        hideRelationship
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
      {...kinshipCardProps(relative)}
      onPress={() => onSelectRoot(relative.id)}
      onLongPress={() => onEditRelative(relative.id)}
    />
  );
}

function ParentSlotsRow({
  fatherLinkId,
  motherLinkId,
  father,
  mother,
  kinshipCardProps,
  onSelectRoot,
  onEditRelative,
}: {
  fatherLinkId: string | null;
  motherLinkId: string | null;
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
          role="father"
          linkId={fatherLinkId}
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
          role="mother"
          linkId={motherLinkId}
          relative={mother}
          kinshipCardProps={kinshipCardProps}
          onSelectRoot={onSelectRoot}
          onEditRelative={onEditRelative}
        />
      </View>
    </View>
  );
}

function CoreCoupleRow({
  root,
  spouse,
  kinshipCardProps,
  resolveRelative,
  onSelectRoot,
  onEditRelative,
}: {
  root: Relative;
  spouse: Relative | null;
  kinshipCardProps: KinshipCardPropsFn;
  resolveRelative: (relative: Relative) => Relative;
  onSelectRoot: (id: string) => void;
  onEditRelative: (id: string) => void;
}) {
  const freshRoot = resolveRelative(root);
  const freshSpouse = spouse ? resolveRelative(spouse) : null;

  if (!freshSpouse) {
    return (
      <View style={styles.coreSingleWrap}>
        <FamilyTreeCard
          relative={freshRoot}
          visualTier="core"
          compact
          highlighted
          {...kinshipCardProps(freshRoot)}
          onPress={() => onSelectRoot(freshRoot.id)}
          onLongPress={() => onEditRelative(freshRoot.id)}
        />
        <Text style={styles.coreBadge}>{SHEZHIRE_FOCUSED_ROOT.coreBadge}</Text>
      </View>
    );
  }

  return (
    <View style={styles.coreCoupleRow}>
      <View style={styles.coreCardWrap}>
        <FamilyTreeCard
          relative={freshRoot}
          visualTier="core"
          compact
          highlighted
          {...kinshipCardProps(freshRoot)}
          onPress={() => onSelectRoot(freshRoot.id)}
          onLongPress={() => onEditRelative(freshRoot.id)}
        />
      </View>
      <View style={styles.coreMarriageLink}>
        <Text style={styles.coreMarriageIcon}>♥</Text>
      </View>
      <View style={styles.coreCardWrap}>
        <FamilyTreeCard
          relative={freshSpouse}
          visualTier="peer"
          compact
          {...kinshipCardProps(freshSpouse)}
          onPress={() => onSelectRoot(freshSpouse.id)}
          onLongPress={() => onEditRelative(freshSpouse.id)}
        />
      </View>
    </View>
  );
}

export function FocusedShezhireTree({
  tree,
  relatives,
  focusCrumbs = [],
  myTreeRootId = null,
  resolveRelative = (relative) => relative,
  lookupRelativeById,
  onSelectRoot,
  onBreadcrumbSelect,
  onBackToMyTree,
  onEditRelative,
  onAddChild,
  onAddParentSideSibling,
}: FocusedShezhireTreeProps) {
  const { root, parents, siblings, spouse, children } = tree;
  const [kinshipDetailTarget, setKinshipDetailTarget] = useState<Relative | null>(null);
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const rootPerson = useMemo(
    () => resolveShezhireRootPerson(root, relatives),
    [relatives, root],
  );
  const freshRoot = rootPerson ? resolveRelative(rootPerson) : resolveRelative(root);

  const parentSlots = useMemo(() => {
    if (!rootPerson) {
      return {
        father: { linkId: null, parent: null },
        mother: { linkId: null, parent: null },
      };
    }

    return resolveShezhireParentSlots(rootPerson, relatives, {
      treeParents: {
        father: parents.father,
        mother: parents.mother,
        fatherId: parents.fatherId,
        motherId: parents.motherId,
      },
      lookupById: lookupRelativeById,
    });
  }, [lookupRelativeById, parents.father, parents.fatherId, parents.mother, parents.motherId, relatives, rootPerson]);

  const freshSpouse = useMemo(() => {
    if (!rootPerson) {
      return null;
    }

    const resolved = resolveShezhireSpouse(rootPerson, relatives, {
      treeSpouse: spouse,
      lookupById: lookupRelativeById,
    });

    return resolved ? resolveRelative(resolved) : null;
  }, [lookupRelativeById, relatives, resolveRelative, rootPerson, spouse]);

  const isMyTree = Boolean(myTreeRootId && freshRoot.id === myTreeRootId);
  const showBackToMyTree = Boolean(myTreeRootId && !isMyTree && onBackToMyTree);
  const hasSiblings = siblings.length > 0;
  const siblingIds = useMemo(() => new Set(siblings.map((sibling) => sibling.id)), [siblings]);
  const visibleChildren = useMemo(
    () =>
      children
        .filter((child) => !siblingIds.has(child.id))
        .map((child) => resolveRelative(child)),
    [children, siblingIds, resolveRelative],
  );
  const childLayout = getCompactChildrenLayout(visibleChildren.length);
  const siblingLayout = getCompactChildrenLayout(siblings.length);
  const freshSiblings = siblings.map((sibling) => resolveRelative(sibling));
  const rootFullName = freshRoot.fullName.trim() || getRelativeDisplayName(freshRoot);
  const showKinshipDetail = useMemo(
    () => (relative: Relative) => setKinshipDetailTarget(relative),
    [],
  );
  const kinshipCardProps = useMemo(
    () => (relative: Relative) => buildKinshipCardProps(freshRoot, relative, relatives, showKinshipDetail),
    [freshRoot, relatives, showKinshipDetail],
  );

  const parentSideTree = useMemo(() => {
    const excludeIds = getFocusedTreeRelativeIds(tree);
    return buildParentSideRelativesTree(freshRoot, relatives, excludeIds);
  }, [freshRoot, relatives, tree]);

  useEffect(() => {
    fadeAnim.setValue(0.4);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 340,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, freshRoot.id]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card goldBorder style={styles.treeCard}>
        <FocusedRootHeader
          fullName={rootFullName}
          showBackButton={showBackToMyTree}
          onBackToMyTree={onBackToMyTree}
        />

        {focusCrumbs.length > 1 && onBreadcrumbSelect ? (
          <ShezhireFocusBreadcrumb
            crumbs={focusCrumbs}
            activeRootId={freshRoot.id}
            onSelect={onBreadcrumbSelect}
          />
        ) : null}

        <TreeSection generation="parents" label={SHEZHIRE_FOCUSED_ROOT.sections.parents}>
          <ParentSlotsRow
            fatherLinkId={parentSlots.father.linkId}
            motherLinkId={parentSlots.mother.linkId}
            father={parentSlots.father.parent ? resolveRelative(parentSlots.father.parent) : null}
            mother={parentSlots.mother.parent ? resolveRelative(parentSlots.mother.parent) : null}
            kinshipCardProps={kinshipCardProps}
            onSelectRoot={onSelectRoot}
            onEditRelative={onEditRelative}
          />
        </TreeSection>

        <TreeConnector subtle />

        {hasSiblings ? (
          <>
            <CollapsibleTreeSection
              generation="peers"
              label={SHEZHIRE_FOCUSED_ROOT.sections.siblings}
              sublabel={SHEZHIRE_SIBLINGS_HELPER}
              itemCount={freshSiblings.length}>
              <Text style={styles.countMeta}>
                {SHEZHIRE_FOCUSED_ROOT.siblingsCount(freshSiblings.length)}
              </Text>
              <View
                style={[styles.childrenRow, siblingLayout.compact && styles.childrenRowCompact]}>
                {freshSiblings.map((sibling) => (
                  <FamilyTreeCard
                    key={`${sibling.id}:${getRelativeDisplayName(sibling)}`}
                    relative={sibling}
                    visualTier="peer"
                    compact
                    mini={siblingLayout.mini}
                    gridItem={siblingLayout.gridItem}
                    {...kinshipCardProps(sibling)}
                    onPress={() => onSelectRoot(sibling.id)}
                    onLongPress={() => onEditRelative(sibling.id)}
                  />
                ))}
              </View>
            </CollapsibleTreeSection>
            <TreeConnector subtle />
          </>
        ) : null}

        <TreeSection
          generation="core"
          label={SHEZHIRE_FOCUSED_ROOT.sections.coreFamily}
          sublabel={getRelativeDisplayName(freshRoot)}>
          <CoreCoupleRow
            root={freshRoot}
            spouse={freshSpouse}
            kinshipCardProps={kinshipCardProps}
            resolveRelative={resolveRelative}
            onSelectRoot={onSelectRoot}
            onEditRelative={onEditRelative}
          />
        </TreeSection>

        <TreeConnector subtle />

        <CollapsibleTreeSection
          generation="children"
          label={SHEZHIRE_FOCUSED_ROOT.sections.children}
          sublabel={
            visibleChildren.length > 0
              ? SHEZHIRE_FOCUSED_ROOT.childrenCount(visibleChildren.length)
              : SHEZHIRE_FOCUSED_ROOT.childrenEmpty
          }
          itemCount={visibleChildren.length}
          defaultCollapsed={visibleChildren.length >= COMPACT_CHILDREN_THRESHOLD}>
          {visibleChildren.length > 0 ? (
            <View
              style={[styles.childrenRow, childLayout.compact && styles.childrenRowCompact]}>
              {visibleChildren.map((child) => (
                <FamilyTreeCard
                  key={`${child.id}:${getRelativeDisplayName(child)}`}
                  relative={child}
                  visualTier="child"
                  compact
                  mini={childLayout.mini}
                  gridItem={childLayout.gridItem}
                  {...kinshipCardProps(child)}
                  onPress={() => onSelectRoot(child.id)}
                  onLongPress={() => onEditRelative(child.id)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyLine}>{SHEZHIRE_FOCUSED_ROOT.childrenEmpty}</Text>
          )}

          <Pressable
            onPress={() => onAddChild(getFocusedAddChildParams(freshRoot, freshSpouse))}
            style={({ pressed }) => [styles.addChildButton, pressed && styles.addChildPressed]}
            accessibilityRole="button"
            accessibilityLabel={SHEZHIRE_FOCUSED_ROOT.addChild}>
            <Text style={styles.addChildIcon}>+</Text>
            <Text style={styles.addChildText}>{SHEZHIRE_FOCUSED_ROOT.addChild}</Text>
          </Pressable>
        </CollapsibleTreeSection>

        <ParentSideRelativesPanel
          rootPerson={freshRoot}
          relatives={relatives}
          tree={parentSideTree}
          resolveRelative={resolveRelative}
          onSelectRoot={onSelectRoot}
          onEditRelative={onEditRelative}
          onAddParentSideSibling={onAddParentSideSibling}
          onShowKinshipDetail={showKinshipDetail}
        />
      </Card>

      <KinshipExplanationModal
        visible={kinshipDetailTarget !== null}
        rootPerson={freshRoot}
        targetPerson={kinshipDetailTarget}
        relatives={relatives}
        onClose={() => setKinshipDetailTarget(null)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  treeCard: {
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#FBF9F4',
  },
  focusHeader: {
    gap: Spacing.xs,
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0D0',
  },
  focusTitle: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '800',
    textAlign: 'center',
  },
  focusSubtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
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
    padding: Spacing.sm,
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
  section_children: {
    backgroundColor: '#FAFAF7',
    borderColor: '#ECE6DA',
  },
  sectionHeader: {
    gap: 2,
    alignItems: 'center',
    flex: 1,
  },
  sectionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sectionTogglePressed: {
    opacity: 0.92,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  sectionLabelCore: {
    color: Palette.greenDeep,
    fontWeight: '800',
  },
  sectionSublabel: {
    ...Typography.caption,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  collapseIcon: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    minWidth: 18,
    textAlign: 'center',
  },
  countMeta: {
    ...Typography.caption,
    color: Palette.textMuted,
    textAlign: 'center',
  },
  emptyLine: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: Spacing.sm,
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
  coreBadge: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  coreCoupleRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  coreCardWrap: {
    flex: 1,
    minWidth: 0,
    maxWidth: 180,
  },
  coreMarriageLink: {
    alignSelf: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4FAF6',
    borderWidth: 1,
    borderColor: Palette.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreMarriageIcon: {
    ...Typography.caption,
    color: Palette.greenDeep,
    fontWeight: '700',
    fontSize: 12,
  },
  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0D8C8',
    borderRadius: 1,
  },
  lineSubtle: {
    backgroundColor: '#EBE4D8',
  },
  connectorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F1E8',
    borderWidth: 1,
    borderColor: '#E0D8C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorBadgeSubtle: {
    backgroundColor: '#FAF8F4',
  },
  connectorIcon: {
    ...Typography.caption,
    color: Palette.textMuted,
    fontWeight: '700',
    lineHeight: 14,
    fontSize: 11,
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
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#D8CEBC',
    borderStyle: 'dashed',
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.md,
  },
  addChildPressed: {
    opacity: 0.92,
    backgroundColor: '#F7F4EE',
  },
  addChildIcon: {
    ...Typography.body,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
  addChildText: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
  },
});
