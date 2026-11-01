import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, type Tint, tints } from '@/lib/theme';
import { Icon, type IconName } from './Icon';

type Props = { value: string; label: string; icon?: IconName; tint?: Tint; onPress?: () => void; alert?: boolean };

/** Number tile for dashboards (two per row). */
export function Stat({ value, label, icon, tint = 'green', onPress, alert }: Props) {
  const t = tints[tint];
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.tile, pressed && { opacity: 0.8 }]}>
      <View style={s.top}>
        {icon ? (
          <View style={[s.chip, { backgroundColor: t.bg }]}>
            <Icon name={icon} size={16} color={t.fg} />
          </View>
        ) : null}
        {alert ? <View style={s.alert} /> : null}
      </View>
      <Text style={s.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={s.label}>{label}</Text>
    </Pressable>
  );
}

export const StatGrid = ({ children }: { children: React.ReactNode }) => <View style={s.grid}>{children}</View>;

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  tile: {
    width: '48.3%',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: 14,
    ...shadow,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', minHeight: 30 },
  chip: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  alert: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.marigold },
  value: { ...font('800'), fontSize: 24, color: colors.ink, marginTop: 8, letterSpacing: -0.5 },
  label: { ...font('500'), fontSize: 12, color: colors.muted, marginTop: 2 },
});
