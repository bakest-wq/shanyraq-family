import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

export type ToastType = 'success' | 'error';

export type ToastInput = {
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastBanner({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const isSuccess = toast.type === 'success';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 16,
        stiffness: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -10,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onDismiss();
      }
    });
  }, [onDismiss, opacity, translateY]);

  return (
    <Animated.View style={[styles.toastWrap, { opacity, transform: [{ translateY }] }]}>
      <Pressable
        onPress={dismiss}
        style={[
          styles.toast,
          isSuccess ? styles.toastSuccess : styles.toastError,
        ]}
        accessibilityRole="alert">
        <Text style={styles.toastTitle}>{toast.title}</Text>
        {toast.message ? <Text style={styles.toastMessage}>{toast.message}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast: ToastItem = { ...input, id };

      setToasts((current) => [...current, toast]);

      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, input.durationMs ?? 3500);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={[styles.host, { top: insets.top + Spacing.sm }]}>
        {toasts.map((toast) => (
          <ToastBanner key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 9999,
    gap: Spacing.sm,
  },
  toastWrap: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  toast: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: 4,
    borderWidth: 1.5,
    ...Shadow.card,
  },
  toastSuccess: {
    backgroundColor: Palette.greenDeep,
    borderColor: Palette.gold,
  },
  toastError: {
    backgroundColor: '#6B2E18',
    borderColor: '#E8A48A',
  },
  toastTitle: {
    ...Typography.subtitle,
    color: Palette.white,
    fontWeight: '700',
  },
  toastMessage: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 20,
  },
});
