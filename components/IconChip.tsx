import { StyleSheet, Text, View } from 'react-native';
import { radius, tints, type Tint } from '@/lib/theme';

/** Emoji inside a soft coloured rounded square. */
export function IconChip({ icon, tint = 'green', size = 44 }: { icon: string; tint?: Tint; size?: number }) {
  return (
    <View style={[s.chip, { width: size, height: size, backgroundColor: tints[tint].bg, borderRadius: size > 50 ? 20 : radius.chip }]}>
      <Text style={{ fontSize: size * 0.48 }}>{icon}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: { alignItems: 'center', justifyContent: 'center' },
});
