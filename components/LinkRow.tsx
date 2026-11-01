import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, type Tint, font } from '@/lib/theme';
import { Icon, type IconName } from './Icon';
import { IconChip } from './IconChip';

type Props = { icon: IconName; tint?: Tint; title: string; subtitle?: string; onPress: () => void; last?: boolean };

/** Settings-style row with icon and chevron. Put several inside one Card. */
export function LinkRow({ icon, tint = 'slate', title, subtitle, onPress, last }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.row, !last && s.border, pressed && { opacity: 0.6 }]}>
      <IconChip icon={icon} tint={tint} size={36} />
      <View style={s.body}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
      </View>
      <Icon name="chevron-forward" size={18} color={colors.faint} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  body: { flex: 1 },
  title: { ...font('600'), fontSize: 15, color: colors.ink },
  sub: { ...font('400'), fontSize: 12, color: colors.muted, marginTop: 2 },
});
