import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { HELPLINES } from '@/lib/emergency';
import { colors, font } from '@/lib/theme';
import { Icon } from './Icon';

export const callNumber = (number: string) => Linking.openURL(`tel:${number}`).catch(() => undefined);

/** One-tap buttons that open the phone dialer for Police, Ambulance, Fire etc. */
export function EmergencyCalls() {
  return (
    <View style={s.grid}>
      {HELPLINES.map((h) => (
        <Pressable key={h.number} onPress={() => callNumber(h.number)} style={({ pressed }) => [s.item, pressed && { opacity: 0.7 }]}>
          <Icon name={h.icon} size={20} color={colors.red} />
          <Text style={s.number}>{h.number}</Text>
          <Text style={s.label} numberOfLines={1}>{h.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  item: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.redBg,
  },
  number: { ...font('800'), fontSize: 18, color: colors.red, marginTop: 4 },
  label: { ...font('600'), fontSize: 11.5, color: colors.ink2, marginTop: 1 },
});
