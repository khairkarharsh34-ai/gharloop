import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, type Tint, font } from '@/lib/theme';
import type { IconName } from './Icon';
import { IconChip } from './IconChip';

type Props = { icon: IconName; tint?: Tint; title: string; subtitle?: string; onPress?: () => void };

/** Module card for the two-column grid. */
export function Tile({ icon, tint, title, subtitle, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [s.tile, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
    >
      <IconChip icon={icon} tint={tint} />
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
    </Pressable>
  );
}

/** Two-column grid wrapper for Tiles. */
export function Grid({ children }: { children: ReactNode }) {
  return <View style={s.grid}>{children}</View>;
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  tile: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.card,
    padding: 16,
    width: '48.3%',
    minHeight: 132,
    ...shadow,
  },
  title: { ...font('700'), fontSize: 15, color: colors.ink, marginTop: 14, letterSpacing: -0.2 },
  sub: { ...font('400'), fontSize: 12, color: colors.muted, marginTop: 3, lineHeight: 16 },
});
