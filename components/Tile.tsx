import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/lib/theme';

type Props = { icon?: string; title: string; subtitle?: string; onPress?: () => void };

/** Square-ish card used in the two-column grid on Home, Need Help, etc. */
export function Tile({ icon, title, subtitle, onPress }: Props) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.tile, pressed && { opacity: 0.75 }]}>
      {icon ? <Text style={s.icon}>{icon}</Text> : null}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 9 },
  tile: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    padding: 14,
    width: '48.7%', // two columns with a ~9px gap, like the prototype
  },
  icon: { fontSize: 24 },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: 6 },
  sub: { fontSize: 10, color: colors.muted, marginTop: 2 },
});
