import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';

import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { FadeTransition } from '@/components/ui/motion/FadeTransition';

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
  const stateKey = loading ? 'loading' : error ? 'error' : isEmpty ? 'empty' : 'content';

  let body: ReactNode;

  if (loading) {
    body = <LoadingState message={loadingMessage} />;
  } else if (error) {
    body = <ErrorState message={error} onRetry={onRetry} />;
  } else if (isEmpty) {
    body = (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        subtitle={emptySubtitle}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  } else {
    body = <View style={contentStyle}>{children}</View>;
  }

  return <FadeTransition transitionKey={stateKey}>{body}</FadeTransition>;
}
