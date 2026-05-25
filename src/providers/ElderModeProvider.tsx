import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { elderModeService } from '@/services/elder-mode.service';
import { ElderModeSettings } from '@/types/elder-mode';
import { AppTheme, createAppTheme } from '@/utils/app-theme';

type ElderModeContextValue = {
  enabled: boolean;
  loading: boolean;
  theme: AppTheme;
  setEnabled: (enabled: boolean) => Promise<void>;
};

const ElderModeContext = createContext<ElderModeContextValue | null>(null);

export function ElderModeProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<ElderModeSettings>({ enabled: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const stored = await elderModeService.get();
      setSettings(stored);
      setLoading(false);
    })();
  }, []);

  const setEnabled = useCallback(async (enabled: boolean) => {
    const next = { enabled };
    setSettings(next);
    await elderModeService.save(next);
  }, []);

  const theme = useMemo(() => createAppTheme(settings.enabled), [settings.enabled]);

  const value = useMemo(
    () => ({
      enabled: settings.enabled,
      loading,
      theme,
      setEnabled,
    }),
    [loading, setEnabled, settings.enabled, theme],
  );

  return <ElderModeContext.Provider value={value}>{children}</ElderModeContext.Provider>;
}

export function useElderModeContext(): ElderModeContextValue {
  const context = useContext(ElderModeContext);

  if (!context) {
    throw new Error('useElderModeContext must be used within ElderModeProvider.');
  }

  return context;
}
