import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, type Tint } from '@/lib/theme';
import { IconChip } from './IconChip';

type Props = { icon: string; tint?: Tint; title: string; subtitle?: string; onPress: () => void; last?: boolean };

/** Settings-style row with icon and chevron. Put several inside one Card. */
export function LinkRow({ icon, tint = 'slate', title, subtitle, onPress, last }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.row, !last && s.border, pressed && { opacity: 0.6 }]}>
      <IconChip icon={icon} tint={tint} size={36} />
      <View style={s.body}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
      </View>
      <Text style={s.chev}>›</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: colors.ink },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  chev: { fontSize: 22, color: colors.faint, marginTop: -2 },
});
