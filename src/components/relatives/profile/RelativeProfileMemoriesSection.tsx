import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { FamilyMemoryCard } from '@/components/family-memories/FamilyMemoryCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { FadeTransition } from '@/components/ui/motion/FadeTransition';
import { FAMILY_MEMORIES_COPY } from '@/constants/family-memories-content';
import { RELATIVE_PROFILE_COPY } from '@/constants/relative-profile-content';
import { useAppTheme } from '@/hooks/useElderMode';
import { Relative } from '@/types/relative';
import { useArchive } from '@/hooks/useArchive';
import { filterMemoriesByRelative, sortMemoriesNewestFirst } from '@/utils/archive-filters';
import { Palette, Radius } from '@/constants/theme';

import { RelativeProfileSection } from './RelativeProfileSection';

type RelativeProfileMemoriesSectionProps = {
  relative: Relative;
};

export function RelativeProfileMemoriesSection({ relative }: RelativeProfileMemoriesSectionProps) {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { memories, removeMemory } = useArchive();

  const relatedMemories = useMemo(
    () => sortMemoriesNewestFirst(filterMemoriesByRelative(memories, relative.id)).slice(0, 3),
    [memories, relative.id],
  );

  const handleAddMemory = () => {
    router.push({
      pathname: '/add-memory',
      params: { relativeId: relative.id },
    });
  };

  const handleOpenMemory = () => {
    router.push({
      pathname: '/family-memories',
      params: { relativeId: relative.id },
    });
  };

  const confirmDelete = (memoryId: string) => {
    Alert.alert(
      FAMILY_MEMORIES_COPY.deleteConfirmTitle,
      FAMILY_MEMORIES_COPY.deleteConfirmHint,
      [
        { text: FAMILY_MEMORIES_COPY.cancelAction, style: 'cancel' },
        {
          text: FAMILY_MEMORIES_COPY.deleteAction,
          style: 'destructive',
          onPress: () => void removeMemory(memoryId),
        },
      ],
    );
  };

  return (
    <FadeTransition transitionKey={`memories-${relative.id}-${relatedMemories.length}`}>
      <RelativeProfileSection
        title={FAMILY_MEMORIES_COPY.profileTitle}
        subtitle={FAMILY_MEMORIES_COPY.profileHint}
        goldBorder>
        {relatedMemories.length > 0 ? (
          <View style={styles.list}>
            {relatedMemories.map((memory) => (
              <FamilyMemoryCard
                key={memory.id}
                memory={memory}
                compact
                onPress={handleOpenMemory}
                onLongPress={() => confirmDelete(memory.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🌿</Text>
            <Text style={styles.emptyTitle}>{RELATIVE_PROFILE_COPY.memoryEmptyTitle}</Text>
            <Text style={styles.emptyText}>{RELATIVE_PROFILE_COPY.memoryEmptyHint}</Text>
          </View>
        )}

        <View style={styles.actions}>
          {relatedMemories.length === 0 ? (
            <PrimaryButton
              label={FAMILY_MEMORIES_COPY.profileAdd}
              variant="green"
              onPress={handleAddMemory}
            />
          ) : (
            <>
              <Pressable
                onPress={handleAddMemory}
                style={({ pressed }) => [styles.linkButton, pressed && styles.linkPressed]}
                accessibilityRole="button">
                <Text style={styles.linkText}>+ {FAMILY_MEMORIES_COPY.profileAdd}</Text>
              </Pressable>
              <Pressable
                onPress={handleOpenMemory}
                style={({ pressed }) => [styles.linkButton, pressed && styles.linkPressed]}
                accessibilityRole="button">
                <Text style={styles.linkText}>{FAMILY_MEMORIES_COPY.profileSeeAll}</Text>
              </Pressable>
            </>
          )}
        </View>
      </RelativeProfileSection>
    </FadeTransition>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    list: {
      gap: theme.spacing.md,
    },
    emptyWrap: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.palette.cream,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: '#EDE6DA',
    },
    emptyIcon: {
      fontSize: theme.elderMode ? 34 : 28,
    },
    emptyTitle: {
      ...theme.typography.body,
      color: theme.palette.textPrimary,
      fontWeight: '700',
      textAlign: 'center',
    },
    emptyText: {
      ...theme.typography.bodySmall,
      color: theme.palette.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 320,
    },
    actions: {
      gap: theme.spacing.sm,
      alignItems: 'center',
    },
    linkButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    linkPressed: {
      opacity: 0.9,
    },
    linkText: {
      ...theme.typography.bodySmall,
      color: theme.palette.gold,
      fontWeight: '700',
      textAlign: 'center',
    },
  });
}
