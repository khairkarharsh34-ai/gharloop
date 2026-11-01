import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/lib/theme';

/** Deep-green panel with soft decorative circles. Used on Home and the login screens. */
export function Hero({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.hero, style]}>
      <View style={[s.blob, s.blob1]} />
      <View style={[s.blob, s.blob2]} />
      <View style={[s.blob, s.blob3]} />
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: colors.green, overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999 },
  blob1: { width: 220, height: 220, right: -70, top: -90, backgroundColor: 'rgba(255,255,255,0.07)' },
  blob2: { width: 160, height: 160, right: -60, bottom: -110, backgroundColor: 'rgba(242,163,58,0.16)' },
  blob3: { width: 120, height: 120, left: -60, top: 90, backgroundColor: 'rgba(255,255,255,0.04)' },
});
