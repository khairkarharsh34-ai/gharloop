import { StyleSheet, View } from 'react-native';
import { radius, tints, type Tint } from '@/lib/theme';
import { Icon, type IconName } from './Icon';

/** Line icon inside a soft coloured rounded square. */
export function IconChip({ icon, tint = 'green', size = 44 }: { icon: IconName; tint?: Tint; size?: number }) {
  const t = tints[tint];
  return (
    <View style={[s.chip, { width: size, height: size, backgroundColor: t.bg, borderRadius: size > 50 ? 20 : radius.chip }]}>
      <Icon name={icon} size={Math.round(size * 0.5)} color={t.fg} />
    </View>
  );
}

const s = StyleSheet.create({
  chip: { alignItems: 'center', justifyContent: 'center' },
});
