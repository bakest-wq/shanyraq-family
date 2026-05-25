import { ReactNode, RefObject, useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useElderMode';
import { useCalmUx } from '@/hooks/useCalmUx';

type ScreenShellProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  scrollRef?: RefObject<ScrollView | null>;
};

export function ScreenShell({
  children,
  header,
  footer,
  contentStyle,
  refreshing = false,
  onRefresh,
  scrollRef,
}: ScreenShellProps) {
  const theme = useAppTheme();
  const { calm } = useCalmUx();
  const styles = useMemo(() => createStyles(theme, calm), [calm, theme]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {header}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.palette.greenDeep}
              colors={[theme.palette.greenDeep]}
            />
          ) : undefined
        }>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}

function createStyles(
  theme: ReturnType<typeof useAppTheme>,
  calm: ReturnType<typeof useCalmUx>['calm'],
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.palette.cream,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.layout.bottomTabInset + theme.spacing.lg,
      flexGrow: 1,
    },
    inner: {
      width: '100%',
      maxWidth: theme.maxContentWidth,
      alignSelf: 'center',
      gap: calm.sectionGap,
    },
  });
}
