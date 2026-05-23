import { ReactNode } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Palette, Spacing } from '@/constants/theme';

type ScreenShellProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function ScreenShell({
  children,
  header,
  footer,
  contentStyle,
  refreshing = false,
  onRefresh,
}: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {header}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Palette.greenDeep}
              colors={[Palette.greenDeep]}
            />
          ) : undefined
        }>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.cream,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: BottomTabInset + Spacing.lg,
    flexGrow: 1,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.lg,
  },
});
