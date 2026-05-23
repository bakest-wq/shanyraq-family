import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';

import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';

type RelativesDataViewProps = {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  loadingMessage?: string;
  emptyIcon?: string;
  emptyTitle: string;
  emptySubtitle: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onRetry?: () => void;
  children: ReactNode;
  contentStyle?: ViewStyle;
};

export function RelativesDataView({
  loading,
  error,
  isEmpty,
  loadingMessage,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  emptyActionLabel,
  onEmptyAction,
  onRetry,
  children,
  contentStyle,
}: RelativesDataViewProps) {
  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        subtitle={emptySubtitle}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return <View style={contentStyle}>{children}</View>;
}
