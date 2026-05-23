import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FamilyUnitBlock } from '@/components/shezhire/FamilyUnitBlock';
import { FamilyTreeCard } from '@/components/shezhire/FamilyTreeCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useRelatives } from '@/hooks/useRelatives';
import { buildFamilyTree } from '@/utils/family-tree';
import { Spacing } from '@/constants/theme';

export default function ShezhireScreen() {
  const router = useRouter();
  const { relatives, loading, error, isEmpty, refetch } = useRelatives();
  const [refreshing, setRefreshing] = useState(false);

  const tree = useMemo(() => buildFamilyTree(relatives), [relatives]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch({ silent: true });
    setRefreshing(false);
  }, [refetch]);

  const openConnect = (id: string) => {
    router.push({
      pathname: '/connect-relative/[id]',
      params: { id },
    });
  };

  const openRelative = (id: string) => {
    router.push({
      pathname: '/relative/[id]',
      params: { id },
    });
  };

  return (
    <ScreenShell
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      header={
        <AppHeader
          title="Шежіре"
          subtitle="Семейное дерево · Shanyraq"
          badge="🌳"
        />
      }
      contentStyle={styles.content}>
      {loading ? (
        <LoadingState message="Шежіре жүктелуде..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="🌳"
            title="Добавьте родственников, чтобы построить шежире."
            subtitle="Туыс қосу · Add relatives first"
            actionLabel="Добавить родственника"
            onAction={() => router.push('/add-relative')}
          />
        </View>
      ) : (
        <>
          {tree.units.length > 0 ? (
            <View style={styles.section}>
              <SectionTitle
                title="Отбасы ағашы"
                subtitle="Родители сверху · дети снизу"
              />
              <View style={styles.unitsList}>
                {tree.units.map((unit) => (
                  <FamilyUnitBlock key={unit.key} unit={unit} />
                ))}
              </View>
            </View>
          ) : null}

          {tree.unlinked.length > 0 ? (
            <View style={styles.section}>
              <SectionTitle
                title="Байланыссыз туыстар"
                subtitle="Unlinked relatives · свяжите с родителями"
              />
              <View style={styles.unlinkedGrid}>
                {tree.unlinked.map((relative) => (
                  <FamilyTreeCard
                    key={relative.id}
                    relative={relative}
                    onPress={() => openRelative(relative.id)}
                    onConnect={() => openConnect(relative.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {tree.units.length === 0 && tree.unlinked.length === 0 ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon="🔗"
                title="Свяжите родственников"
                subtitle="Нажмите «Связать» и выберите отца и мать"
                actionLabel="Добавить родственника"
                onAction={() => router.push('/add-relative')}
              />
            </View>
          ) : null}

          <PrimaryButton
            label="Добавить родственника"
            sublabel="Жаңа туыс · New relative"
            variant="green"
            onPress={() => router.push('/add-relative')}
          />
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
    paddingVertical: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  unitsList: {
    gap: Spacing.xl,
  },
  unlinkedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
