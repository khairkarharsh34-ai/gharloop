import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

// Small dark message above the tab bar (same as the prototype's toast).
// Used instead of Alert because Alert does nothing in the web version.
const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: string) => {
    setMessage(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message ? (
        <View pointerEvents="none" style={s.wrap}>
          <Text style={s.toast}>{message}</Text>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 96, alignItems: 'center' },
  toast: {
    backgroundColor: colors.ink,
    color: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 11,
    fontSize: 12,
    overflow: 'hidden',
    textAlign: 'center',
  },
});
