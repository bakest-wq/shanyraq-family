import { useElderModeContext } from '@/providers/ElderModeProvider';

export function useElderMode() {
  const { enabled, loading, setEnabled } = useElderModeContext();

  return {
    enabled,
    loading,
    isElderMode: enabled,
    setEnabled,
  };
}

export function useAppTheme() {
  const { theme } = useElderModeContext();
  return theme;
}
