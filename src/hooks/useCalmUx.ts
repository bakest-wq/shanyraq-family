import { useElderMode, useAppTheme } from '@/hooks/useElderMode';
import type { AppTheme } from '@/utils/app-theme';

/** Premium Calm UX — theme + spacing + touch rules in one hook. */
export function useCalmUx(): {
  theme: AppTheme;
  elderMode: boolean;
  calm: AppTheme['calm'];
  layout: AppTheme['layout'];
} {
  const theme = useAppTheme();
  const { enabled: elderMode } = useElderMode();

  return {
    theme,
    elderMode,
    calm: theme.calm,
    layout: theme.layout,
  };
}
