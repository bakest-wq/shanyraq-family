import { memo, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FamilyTreeCard } from '@/components/shezhire/FamilyTreeCard';
import { JurtViewTabs } from '@/components/shezhire/JurtViewTabs';
import { AnimatedPressable } from '@/components/ui/motion/AnimatedPressable';
import { CollapsibleSection } from '@/components/ui/motion/CollapsibleSection';
import { FadeTransition } from '@/components/ui/motion/FadeTransition';
import { CALM_UX } from '@/constants/calm-ux';
import { SHEZHIRE_FOCUSED_ROOT, SHEZHIRE_JURT, getShezhireJurtContextHeaderKk } from '@/constants/family-ux-content';
import { countJurtRelatives } from '@/services/family-graph.service';
import type {
  JurtGroupsTree,
  JurtKind,
  JurtRelativeEntry,
  JurtSideGroup,
  KayinJurtSubgroup,
  KayinJurtSubgroupId,
  OzJurtSubgroup,
  OzJurtSubgroupId,
} from '@/services/family-graph.types';
import { buildPreparedKinshipCardProps } from '@/services/shezhire-view.service';
import type { KinshipLabelMap } from '@/services/shezhire-view.types';
import type { Relative } from '@/types/relative';
import {
  countKayinJurtSubgroup,
  filterVisibleKayinJurtSubgroups,
} from '@/utils/kayin-jurt-subgroups';
import { countOzJurtSubgroup, filterVisibleOzJurtSubgroups } from '@/utils/oz-jurt-subgroups';
import {
  buildJurtGroupSessionKey,
  getDefaultJurtGroupExpanded,
  getJurtGroupDensityTier,
  isJurtGroupCollapsible,
  readJurtGroupExpanded,
  writeJurtGroupExpanded,
  type JurtDensityGroupId,
} from '@/utils/jurt-density';
import { getRelativeDisplayName } from '@/utils/relative-names';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type JurtRelativesPanelProps = {
  rootPerson: Relative;
  relatives: Relative[];
  threeJurtGroups: JurtGroupsTree;
  kinshipLabels: KinshipLabelMap;
  resolveRelative: (relative: Relative) => Relative;
  onSelectRoot: (relativeId: string) => void;
  onEditRelative: (relativeId: string) => void;
};

type JurtVisualTier = 'primary' | 'secondary' | 'extended';

function densityTierToVisualTier(tier: ReturnType<typeof getJurtGroupDensityTier>): JurtVisualTier {
  return tier;
}

const OZ_SUBGROUP_VISUAL_TIER: Record<OzJurtSubgroupId, JurtVisualTier> = {
  siblings: densityTierToVisualTier(getJurtGroupDensityTier('siblings')),
  kelinler: densityTierToVisualTier(getJurtGroupDensityTier('kelinler')),
  jengeler: densityTierToVisualTier(getJurtGroupDensityTier('jengeler')),
  jezdelder: densityTierToVisualTier(getJurtGroupDensityTier('jezdelder')),
  brotherChildren: densityTierToVisualTier(getJurtGroupDensityTier('brotherChildren')),
  niecesNephews: densityTierToVisualTier(getJurtGroupDensityTier('niecesNephews')),
  paternalRelatives: densityTierToVisualTier(getJurtGroupDensityTier('paternalRelatives')),
  kuda: densityTierToVisualTier(getJurtGroupDensityTier('kuda')),
};

const KAYIN_SUBGROUP_VISUAL_TIER: Record<KayinJurtSubgroupId, JurtVisualTier> = {
  kayin_ata_ene: densityTierToVisualTier(getJurtGroupDensityTier('kayin_ata_ene')),
  kayin_siblings: densityTierToVisualTier(getJurtGroupDensityTier('kayin_siblings')),
  kuda: densityTierToVisualTier(getJurtGroupDensityTier('kuda')),
};

const PREVIEW_LIMIT = SHEZHIRE_JURT.previewLimit;

function getOzSubgroupTitle(id: OzJurtSubgroupId): string {
  return SHEZHIRE_JURT.ozSubgroups[id];
}

function getKayinSubgroupTitle(id: KayinJurtSubgroupId): string {
  return SHEZHIRE_JURT.kayinSubgroups[id];
}

function buildJurtKinshipCardProps(
  rootPerson: Relative,
  relative: Relative,
  kinshipLabels: KinshipLabelMap,
) {
  return buildPreparedKinshipCardProps(kinshipLabels, rootPerson, relative, {
    kinshipAboveName: true,
    hideRelationship: true,
  });
}

type JurtCardHandlers = {
  rootPerson: Relative;
  kinshipLabels: KinshipLabelMap;
  resolveRelative: (relative: Relative) => Relative;
  onSelectRoot: (relativeId: string) => void;
  onEditRelative: (relativeId: string) => void;
};

const JurtFamilyTreeCard = memo(function JurtFamilyTreeCard({
  rootPerson,
  kinshipLabels,
  relative,
  resolveRelative,
  onSelectRoot,
  onEditRelative,
  visualTier = 'peer',
  compact,
  mini,
  gridItem,
}: JurtCardHandlers & {
  relative: Relative;
  visualTier?: 'parent' | 'core' | 'peer' | 'child';
  compact?: boolean;
  mini?: boolean;
  gridItem?: boolean;
}) {
  const fresh = resolveRelative(relative);

  return (
    <FamilyTreeCard
      relative={fresh}
      visualTier={visualTier}
      compact={compact}
      mini={mini}
      gridItem={gridItem}
      {...buildJurtKinshipCardProps(rootPerson, fresh, kinshipLabels)}
      onPress={() => onSelectRoot(fresh.id)}
      onLongPress={() => onEditRelative(fresh.id)}
    />
  );
});

function flattenJurtPeople(entries: JurtRelativeEntry[], extraRelatives: Relative[]): Relative[] {
  const people: Relative[] = [];

  for (const entry of entries) {
    people.push(entry.person);
    people.push(...entry.children);
  }

  people.push(...extraRelatives);
  return people;
}

function JurtStandardPeopleList({
  people,
  cardHandlers,
  visualTier = 'secondary',
}: {
  people: Relative[];
  cardHandlers: JurtCardHandlers;
  visualTier?: JurtVisualTier;
}) {
  const useMiniCard = visualTier !== 'primary';

  return (
    <View style={styles.standardPeopleList}>
      {people.map((relative) => (
        <JurtFamilyTreeCard
          key={`${relative.id}:${getRelativeDisplayName(relative)}`}
          {...cardHandlers}
          relative={relative}
          visualTier="child"
          compact
          mini={useMiniCard}
          gridItem={useMiniCard}
        />
      ))}
    </View>
  );
}

function JurtExtendedPeopleGrid({
  people,
  cardHandlers,
}: {
  people: Relative[];
  cardHandlers: JurtCardHandlers;
}) {
  const threshold = CALM_UX.performance.virtualizeListThreshold;
  const columns = CALM_UX.performance.jurtGridColumns;

  const renderCard = (relative: Relative) => (
    <JurtFamilyTreeCard
      key={`${relative.id}:${getRelativeDisplayName(relative)}`}
      {...cardHandlers}
      relative={relative}
      visualTier="child"
      compact
      mini
      gridItem
    />
  );

  if (people.length < threshold) {
    return <View style={styles.extendedGrid}>{people.map((relative) => renderCard(relative))}</View>;
  }

  return (
    <FlatList
      data={people}
      scrollEnabled={false}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={columns > 1 ? styles.extendedGridRow : undefined}
      contentContainerStyle={styles.extendedGrid}
      renderItem={({ item }) => renderCard(item)}
    />
  );
}

function JurtShowMoreButton({ hiddenCount, onPress }: { hiddenCount: number; onPress: () => void }) {
  if (hiddenCount <= 0) {
    return null;
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      style={styles.showMoreButton}
      accessibilityRole="button"
      accessibilityLabel={SHEZHIRE_JURT.showMorePeople(hiddenCount)}>
      <Text style={styles.showMoreText}>{SHEZHIRE_JURT.showMorePeople(hiddenCount)}</Text>
    </AnimatedPressable>
  );
}

function JurtSecondaryEntryCard({
  entry,
  cardHandlers,
  visualTier,
  entryWrapStyle = styles.secondaryEntry,
}: {
  entry: JurtRelativeEntry;
  cardHandlers: JurtCardHandlers;
  visualTier: JurtVisualTier;
  entryWrapStyle?: StyleProp<ViewStyle>;
}) {
  const [childrenExpanded, setChildrenExpanded] = useState(false);
  const { resolveRelative } = cardHandlers;
  const person = resolveRelative(entry.person);
  const children = entry.children.map((child) => resolveRelative(child));
  const useMiniCard = visualTier !== 'primary';

  return (
    <View style={entryWrapStyle}>
      <JurtFamilyTreeCard
        {...cardHandlers}
        relative={person}
        compact
        mini={useMiniCard}
        gridItem={useMiniCard}
      />

      {children.length > 0 ? (
        <View style={styles.entryChildrenBlock}>
          <AnimatedPressable
            onPress={() => setChildrenExpanded((current) => !current)}
            style={styles.childrenToggle}
            accessibilityRole="button"
            accessibilityState={{ expanded: childrenExpanded }}>
            <Text style={styles.childrenToggleText}>
              {childrenExpanded ? '▾' : '▸'} {SHEZHIRE_FOCUSED_ROOT.sections.children} ({children.length})
            </Text>
          </AnimatedPressable>

          <CollapsibleSection expanded={childrenExpanded} style={styles.childrenGrid}>
            {children.map((child) => (
              <JurtFamilyTreeCard
                key={`${child.id}:${getRelativeDisplayName(child)}`}
                {...cardHandlers}
                relative={child}
                visualTier="child"
                compact
                mini
                gridItem
              />
            ))}
          </CollapsibleSection>
        </View>
      ) : null}
    </View>
  );
}

function JurtGroupBody({
  entries,
  extraRelatives,
  visualTier,
  showAll,
  onShowMore,
  cardHandlers,
}: {
  entries: JurtRelativeEntry[];
  extraRelatives: Relative[];
  visualTier: JurtVisualTier;
  showAll: boolean;
  onShowMore: () => void;
  cardHandlers: JurtCardHandlers;
}) {
  const people = useMemo(
    () => flattenJurtPeople(entries, extraRelatives),
    [entries, extraRelatives],
  );
  const hiddenCount = Math.max(people.length - PREVIEW_LIMIT, 0);

  if (visualTier === 'extended') {
    const visiblePeople = showAll ? people : people.slice(0, PREVIEW_LIMIT);

    return (
      <View style={styles.groupBody}>
        <JurtExtendedPeopleGrid people={visiblePeople} cardHandlers={cardHandlers} />
        {!showAll && hiddenCount > 0 ? (
          <JurtShowMoreButton hiddenCount={hiddenCount} onPress={onShowMore} />
        ) : null}
      </View>
    );
  }

  const visibleEntries = showAll ? entries : entries.slice(0, PREVIEW_LIMIT);
  const visibleExtras = showAll
    ? extraRelatives
    : extraRelatives.slice(0, Math.max(PREVIEW_LIMIT - visibleEntries.length, 0));
  const secondaryHiddenCount = Math.max(people.length - PREVIEW_LIMIT, 0);
  const entryWrapStyle = visualTier === 'primary' ? styles.primaryEntry : styles.secondaryEntry;

  return (
    <View style={styles.groupBody}>
      {visibleEntries.map((entry) => (
        <JurtSecondaryEntryCard
          key={entry.person.id}
          entry={entry}
          cardHandlers={cardHandlers}
          visualTier={visualTier}
          entryWrapStyle={entryWrapStyle}
        />
      ))}

      {visibleExtras.length > 0 ? (
        <JurtStandardPeopleList
          people={visibleExtras}
          cardHandlers={cardHandlers}
          visualTier={visualTier}
        />
      ) : null}

      {!showAll && secondaryHiddenCount > 0 ? (
        <JurtShowMoreButton hiddenCount={secondaryHiddenCount} onPress={onShowMore} />
      ) : null}
    </View>
  );
}

function JurtDensityGroup({
  groupId,
  title,
  count,
  entries,
  extraRelatives,
  visualTier,
  contextHeaderText,
  cardHandlers,
}: {
  groupId: JurtDensityGroupId;
  title: string;
  count: number;
  entries: JurtRelativeEntry[];
  extraRelatives: Relative[];
  visualTier: JurtVisualTier;
  contextHeaderText?: string;
  cardHandlers: JurtCardHandlers;
}) {
  if (count <= 0) {
    return null;
  }

  const sessionKey = buildJurtGroupSessionKey(cardHandlers.rootPerson.id, groupId);
  const defaultExpanded = getDefaultJurtGroupExpanded(groupId);
  const collapsible = isJurtGroupCollapsible(groupId);
  const alwaysExpanded = !collapsible;

  const [expanded, setExpanded] = useState(() => readJurtGroupExpanded(sessionKey, defaultExpanded));
  const [showAll, setShowAll] = useState(alwaysExpanded);

  useEffect(() => {
    setExpanded(readJurtGroupExpanded(sessionKey, defaultExpanded));
    setShowAll(alwaysExpanded);
  }, [alwaysExpanded, defaultExpanded, sessionKey]);

  const handleToggle = () => {
    if (!collapsible) {
      return;
    }

    setExpanded((current) => {
      const next = !current;

      if (!next) {
        setShowAll(false);
      }

      writeJurtGroupExpanded(sessionKey, next);
      return next;
    });
  };

  const isOpen = alwaysExpanded || expanded;
  const isPrimaryGroup = visualTier === 'primary';
  const isSecondaryGroup = visualTier === 'secondary';
  const isExtendedGroup = visualTier === 'extended';
  const headerTitle = SHEZHIRE_JURT.groupTitleOnly(title);
  const headerAccessibilityLabel = isPrimaryGroup
    ? SHEZHIRE_JURT.groupHeader(title, count)
    : `${headerTitle}, ${count}`;

  return (
    <View
      style={[
        styles.groupSection,
        isSecondaryGroup && styles.groupSectionSecondary,
        isExtendedGroup && styles.groupSectionExtended,
      ]}>
      {collapsible ? (
        <AnimatedPressable
          onPress={handleToggle}
          style={[
            styles.groupHeader,
            isSecondaryGroup && styles.groupHeaderSecondary,
            isExtendedGroup && styles.groupHeaderExtended,
          ]}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          accessibilityLabel={headerAccessibilityLabel}>
          <View style={styles.groupHeaderTitleRow}>
            <Text
              style={[
                styles.groupTitle,
                isSecondaryGroup && styles.groupTitleSecondary,
                isExtendedGroup && styles.groupTitleExtended,
              ]}>
              {headerTitle}
            </Text>
            {count > 0 ? (
              <Text
                style={[
                  styles.groupCount,
                  isPrimaryGroup && styles.groupCountPrimary,
                  isSecondaryGroup && styles.groupCountSecondary,
                  isExtendedGroup && styles.groupCountExtended,
                ]}>
                {SHEZHIRE_JURT.groupCountQuiet(count)}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.groupChevron, isExtendedGroup && styles.groupChevronExtended]}>
            {isOpen ? '▾' : '▸'}
          </Text>
        </AnimatedPressable>
      ) : (
        <View
          style={[styles.groupHeaderStatic, isPrimaryGroup && styles.groupHeaderPrimaryStatic]}
          accessibilityLabel={headerAccessibilityLabel}>
          <View style={styles.groupHeaderTitleRow}>
            <Text style={styles.groupTitle}>{headerTitle}</Text>
            {count > 0 ? (
              <Text style={[styles.groupCount, styles.groupCountPrimary]}>
                {SHEZHIRE_JURT.groupCountQuiet(count)}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {contextHeaderText && isOpen ? (
        <Text style={styles.groupContextHeader}>{contextHeaderText}</Text>
      ) : null}

      {alwaysExpanded ? (
        <View style={styles.groupContent}>
          <JurtGroupBody
            entries={entries}
            extraRelatives={extraRelatives}
            visualTier={visualTier}
            showAll
            onShowMore={() => undefined}
            cardHandlers={cardHandlers}
          />
        </View>
      ) : (
        <CollapsibleSection expanded={isOpen} style={styles.groupContent}>
          <JurtGroupBody
            entries={entries}
            extraRelatives={extraRelatives}
            visualTier={visualTier}
            showAll={showAll}
            onShowMore={() => setShowAll(true)}
            cardHandlers={cardHandlers}
          />
        </CollapsibleSection>
      )}
    </View>
  );
}

function KayinJurtContent({
  group,
  cardHandlers,
}: {
  group: JurtSideGroup;
  cardHandlers: JurtCardHandlers;
}) {
  const visibleSubgroups = useMemo(
    () => filterVisibleKayinJurtSubgroups((group.subgroups ?? []) as KayinJurtSubgroup[]),
    [group.subgroups],
  );

  if (visibleSubgroups.length === 0) {
    return (
      <Text style={styles.emptyHint}>
        {group.guidanceMessage ?? SHEZHIRE_JURT.empty.kayin}
      </Text>
    );
  }

  return (
    <View style={styles.sideBody}>
      {visibleSubgroups.map((subgroup) => (
        <JurtDensityGroup
          key={subgroup.id}
          groupId={subgroup.id}
          title={getKayinSubgroupTitle(subgroup.id)}
          count={countKayinJurtSubgroup(subgroup)}
          entries={subgroup.entries}
          extraRelatives={subgroup.extraRelatives}
          visualTier={KAYIN_SUBGROUP_VISUAL_TIER[subgroup.id]}
          contextHeaderText={
            subgroup.id === 'kuda' ? getShezhireJurtContextHeaderKk('kuda') : undefined
          }
          cardHandlers={cardHandlers}
        />
      ))}
    </View>
  );
}

function OzJurtContent({
  group,
  cardHandlers,
}: {
  group: JurtSideGroup;
  cardHandlers: JurtCardHandlers;
}) {
  const visibleSubgroups = useMemo(
    () => filterVisibleOzJurtSubgroups((group.subgroups ?? []) as OzJurtSubgroup[]),
    [group.subgroups],
  );

  if (visibleSubgroups.length === 0) {
    return (
      <Text style={styles.emptyHint}>
        {group.guidanceMessage ?? SHEZHIRE_JURT.empty.oz}
      </Text>
    );
  }

  return (
    <View style={styles.sideBody}>
      {visibleSubgroups.map((subgroup) => (
        <JurtDensityGroup
          key={subgroup.id}
          groupId={subgroup.id}
          title={getOzSubgroupTitle(subgroup.id)}
          count={countOzJurtSubgroup(subgroup)}
          entries={subgroup.entries}
          extraRelatives={subgroup.extraRelatives}
          visualTier={OZ_SUBGROUP_VISUAL_TIER[subgroup.id]}
          contextHeaderText={
            subgroup.id === 'kuda' ? getShezhireJurtContextHeaderKk('kuda') : undefined
          }
          cardHandlers={cardHandlers}
        />
      ))}
    </View>
  );
}

function getSideGroupTitle(section: 'oz' | 'nagashy' | 'kayin'): string {
  if (section === 'oz') {
    return SHEZHIRE_JURT.tabs.oz;
  }

  return SHEZHIRE_JURT.sideGroups[section];
}

function JurtSideContent({
  group,
  section,
  cardHandlers,
}: {
  group: JurtSideGroup;
  section: 'oz' | 'nagashy' | 'kayin';
  cardHandlers: JurtCardHandlers;
}) {
  const count = countJurtRelatives(group);

  if (count === 0) {
    return (
      <Text style={styles.emptyHint}>
        {group.guidanceMessage ?? SHEZHIRE_JURT.empty[section === 'oz' ? 'oz' : section]}
      </Text>
    );
  }

  return (
    <View style={styles.sideBody}>
      <JurtDensityGroup
        groupId={section}
        title={getSideGroupTitle(section)}
        count={count}
        entries={group.entries}
        extraRelatives={group.extraRelatives}
        visualTier="extended"
        cardHandlers={cardHandlers}
      />
    </View>
  );
}

export const JurtRelativesPanel = memo(function JurtRelativesPanel({
  rootPerson,
  relatives,
  threeJurtGroups,
  kinshipLabels,
  resolveRelative,
  onSelectRoot,
  onEditRelative,
}: JurtRelativesPanelProps) {
  const [activeJurt, setActiveJurt] = useState<JurtKind>('oz');

  const cardHandlers = useMemo<JurtCardHandlers>(
    () => ({
      rootPerson,
      kinshipLabels,
      resolveRelative,
      onSelectRoot,
      onEditRelative,
    }),
    [kinshipLabels, onEditRelative, onSelectRoot, resolveRelative, rootPerson],
  );

  const jurtCounts = useMemo(
    () => ({
      oz: countJurtRelatives(threeJurtGroups.oz),
      nagashy: countJurtRelatives(threeJurtGroups.nagashy),
      kayin: countJurtRelatives(threeJurtGroups.kayin),
    }),
    [threeJurtGroups],
  );

  useEffect(() => {
    setActiveJurt('oz');
  }, [rootPerson.id]);

  const activeGroup = threeJurtGroups[activeJurt];
  const activeContextHeader = useMemo(
    () => getShezhireJurtContextHeaderKk(activeJurt),
    [activeJurt],
  );

  return (
    <View style={styles.panel}>
      <JurtViewTabs
        value={activeJurt}
        counts={jurtCounts}
        contextText={activeContextHeader}
        onChange={setActiveJurt}
      />

      <FadeTransition transitionKey={activeJurt}>
        {activeJurt === 'oz' ? (
          <OzJurtContent group={activeGroup} cardHandlers={cardHandlers} />
        ) : activeJurt === 'kayin' ? (
          <KayinJurtContent group={activeGroup} cardHandlers={cardHandlers} />
        ) : (
          <JurtSideContent group={activeGroup} section={activeJurt} cardHandlers={cardHandlers} />
        )}
      </FadeTransition>
    </View>
  );
});

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.lg,
  },
  sideBody: {
    gap: Spacing.md,
  },
  groupSection: {
    borderRadius: Radius.lg,
    backgroundColor: Palette.cream,
    borderWidth: 1,
    borderColor: Palette.creamDark,
    overflow: 'hidden',
    ...Shadow.soft,
  },
  groupSectionSecondary: {
    backgroundColor: '#FAF8F4',
    borderColor: '#EDE7DC',
    shadowOpacity: 0.04,
    elevation: 0,
  },
  groupSectionExtended: {
    backgroundColor: '#F7F5F0',
    borderColor: '#ECE6DA',
    shadowOpacity: 0,
    elevation: 0,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    minHeight: 48,
  },
  groupHeaderSecondary: {
    minHeight: 44,
    paddingVertical: Spacing.sm,
  },
  groupHeaderExtended: {
    minHeight: 40,
    paddingVertical: Spacing.xs + 2,
  },
  groupHeaderStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm + 2,
    paddingBottom: Spacing.xs,
    minHeight: 44,
  },
  groupHeaderPrimaryStatic: {
    minHeight: 48,
  },
  groupHeaderTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  groupTitle: {
    ...Typography.bodySmall,
    color: Palette.greenDeep,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  groupTitleSecondary: {
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  groupTitleExtended: {
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  groupCount: {
    ...Typography.caption,
    color: Palette.textMuted,
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.75,
  },
  groupCountPrimary: {
    color: Palette.greenMid,
    fontWeight: '600',
    opacity: 0.85,
  },
  groupCountSecondary: {
    opacity: 0.7,
  },
  groupCountExtended: {
    opacity: 0.6,
  },
  groupContextHeader: {
    ...Typography.caption,
    color: Palette.textMuted,
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
    opacity: 0.9,
  },
  groupChevron: {
    ...Typography.bodySmall,
    color: Palette.greenMid,
    fontWeight: '600',
    width: 18,
    textAlign: 'center',
    opacity: 0.75,
  },
  groupChevronExtended: {
    color: Palette.textMuted,
    opacity: 0.55,
  },
  groupContent: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm + 2,
    gap: Spacing.xs,
  },
  groupBody: {
    gap: Spacing.sm,
  },
  emptyHint: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
    lineHeight: 24,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  secondaryEntry: {
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: '#EDE7DC',
  },
  primaryEntry: {
    gap: Spacing.sm,
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: Palette.white,
    borderWidth: 1.5,
    borderColor: '#E8E0D0',
  },
  standardPeopleList: {
    gap: Spacing.sm,
  },
  entryChildrenBlock: {
    gap: Spacing.xs,
    paddingLeft: Spacing.xs,
  },
  childrenToggle: {
    paddingVertical: Spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  childrenToggleText: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '700',
  },
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  extendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  extendedGridRow: {
    gap: Spacing.xs,
  },
  showMoreButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.creamDark,
  },
  showMoreText: {
    ...Typography.caption,
    color: Palette.greenMid,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
