import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/motion/AnimatedPressable';
import { CollapsibleSection } from '@/components/ui/motion/CollapsibleSection';
import { FadeTransition } from '@/components/ui/motion/FadeTransition';
import { COGNITIVE_LOAD_COPY } from '@/constants/cognitive-load-content';
import { RELATIVE_PROFILE_COPY } from '@/constants/relative-profile-content';
import { useAppTheme } from '@/hooks/useElderMode';
import { useProfileFamilyPreparedView } from '@/hooks/useShezhirePreparedView';
import type { Relative } from '@/types/relative';

import { RelativeProfileAddFamilyLink } from './RelativeProfileAddFamilyLink';
import { RelativeProfileFamilyMemberCard } from './RelativeProfileFamilyMemberCard';
import { RelativeProfileSection } from './RelativeProfileSection';

type RelativeProfileFamilyRingProps = {
  relative: Relative;
  /** @deprecated Prepared in hook — kept for call-site compatibility. */
  relatives?: Relative[];
  /** @deprecated Prepared in hook — kept for call-site compatibility. */
  anchorPerson?: Relative | null;
  canEdit?: boolean;
  onOpenRelative: (relativeId: string) => void;
};

type FamilySlotProps = {
  label: string;
  children: ReactNode;
};

function FamilySlot({ label, children }: FamilySlotProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createSlotStyles(theme), [theme]);

  return (
    <View style={styles.slot}>
      <Text style={styles.slotLabel}>{label}</Text>
      <View style={styles.slotBody}>{children}</View>
    </View>
  );
}

function SiblingsCollapsible({
  siblings,
  kinshipLabels,
  onOpenRelative,
}: {
  siblings: Relative[];
  kinshipLabels: ReadonlyMap<string, string>;
  onOpenRelative: (relativeId: string) => void;
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createSiblingStyles(theme), [theme]);
  const [expanded, setExpanded] = useState(false);

  if (siblings.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <AnimatedPressable
        onPress={() => setExpanded((current) => !current)}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded }}>
        <Text style={styles.title}>{RELATIVE_PROFILE_COPY.sections.siblings}</Text>
        <Text style={styles.toggle}>
          {expanded ? COGNITIVE_LOAD_COPY.collapse : COGNITIVE_LOAD_COPY.expand}
        </Text>
      </AnimatedPressable>
      <CollapsibleSection expanded={expanded}>
        <View style={styles.list}>
          {siblings.map((sibling) => (
            <RelativeProfileFamilyMemberCard
              key={sibling.id}
              relative={sibling}
              roleLabel={RELATIVE_PROFILE_COPY.sections.siblings}
              kinshipLine={kinshipLabels.get(sibling.id) ?? null}
              onPress={() => onOpenRelative(sibling.id)}
            />
          ))}
        </View>
      </CollapsibleSection>
    </View>
  );
}

export function RelativeProfileFamilyRing({
  relative,
  canEdit = true,
  onOpenRelative,
}: RelativeProfileFamilyRingProps) {
  const prepared = useProfileFamilyPreparedView(relative);
  const ring = prepared?.familyRing;
  const kinshipLabels = prepared?.kinshipLabels ?? new Map<string, string>();

  if (!ring) {
    return null;
  }

  const kinshipFromPrepared = (person: Relative) => kinshipLabels.get(person.id) ?? null;

  return (
    <FadeTransition transitionKey={relative.id}>
      <RelativeProfileSection
        title={RELATIVE_PROFILE_COPY.sections.family}
        subtitle={RELATIVE_PROFILE_COPY.familySectionHint}
        goldBorder>
        {(ring.father || canEdit) ? (
          <FamilySlot label={RELATIVE_PROFILE_COPY.familySlots.father}>
            {ring.father ? (
              <RelativeProfileFamilyMemberCard
                relative={ring.father}
                roleLabel={RELATIVE_PROFILE_COPY.familySlots.father}
                kinshipLine={kinshipFromPrepared(ring.father)}
                onPress={() => onOpenRelative(ring.father!.id)}
              />
            ) : canEdit ? (
              <RelativeProfileAddFamilyLink kind="father" targetPerson={relative} />
            ) : null}
          </FamilySlot>
        ) : null}

        {(ring.mother || canEdit) ? (
          <FamilySlot label={RELATIVE_PROFILE_COPY.familySlots.mother}>
            {ring.mother ? (
              <RelativeProfileFamilyMemberCard
                relative={ring.mother}
                roleLabel={RELATIVE_PROFILE_COPY.familySlots.mother}
                kinshipLine={kinshipFromPrepared(ring.mother)}
                onPress={() => onOpenRelative(ring.mother!.id)}
              />
            ) : canEdit ? (
              <RelativeProfileAddFamilyLink kind="mother" targetPerson={relative} />
            ) : null}
          </FamilySlot>
        ) : null}

        {(ring.spouse || canEdit) ? (
          <FamilySlot label={RELATIVE_PROFILE_COPY.familySlots.spouse}>
            {ring.spouse ? (
              <RelativeProfileFamilyMemberCard
                relative={ring.spouse}
                roleLabel={RELATIVE_PROFILE_COPY.familySlots.spouse}
                kinshipLine={kinshipFromPrepared(ring.spouse)}
                onPress={() => onOpenRelative(ring.spouse!.id)}
              />
            ) : canEdit ? (
              <RelativeProfileAddFamilyLink kind="spouse" targetPerson={relative} />
            ) : null}
          </FamilySlot>
        ) : null}

        {(ring.children.length > 0 || canEdit) ? (
          <FamilySlot label={RELATIVE_PROFILE_COPY.familySlots.children}>
            {ring.children.length > 0 ? (
              <View style={styles.childrenList}>
                {ring.children.map((child) => (
                  <RelativeProfileFamilyMemberCard
                    key={child.id}
                    relative={child}
                    roleLabel={RELATIVE_PROFILE_COPY.familySlots.children}
                    kinshipLine={kinshipFromPrepared(child)}
                    onPress={() => onOpenRelative(child.id)}
                  />
                ))}
              </View>
            ) : null}
            {canEdit ? (
              <RelativeProfileAddFamilyLink
                kind="child"
                targetPerson={relative}
                spouse={ring.spouse}
              />
            ) : null}
          </FamilySlot>
        ) : null}

        <SiblingsCollapsible
          siblings={ring.siblings}
          kinshipLabels={kinshipLabels}
          onOpenRelative={onOpenRelative}
        />
      </RelativeProfileSection>
    </FadeTransition>
  );
}

const styles = StyleSheet.create({
  childrenList: {
    gap: 8,
  },
});

function createSlotStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    slot: {
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: '#EDE6DA',
    },
    slotLabel: {
      ...theme.typography.caption,
      color: theme.palette.greenDeep,
      fontWeight: '800',
    },
    slotBody: {
      gap: theme.spacing.sm,
    },
  });
}

function createSiblingStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    wrap: {
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: '#EDE6DA',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    title: {
      ...theme.typography.caption,
      color: theme.palette.greenDeep,
      fontWeight: '800',
      flex: 1,
    },
    toggle: {
      ...theme.typography.caption,
      color: theme.palette.greenMid,
      fontWeight: '700',
    },
    list: {
      gap: theme.spacing.sm,
    },
  });
}
