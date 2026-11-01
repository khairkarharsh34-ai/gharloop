import { StyleSheet, View } from 'react-native';
import { colors } from '@/lib/theme';

export function ProgressBar({ value, color = colors.green }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const s = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: '#efede7', overflow: 'hidden', marginTop: 10 },
  fill: { height: '100%', borderRadius: 4 },
});
