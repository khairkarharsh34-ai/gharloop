import { StyleSheet, Text, View } from 'react-native';
import { badge } from '@/lib/format';
import { colors, font } from '@/lib/theme';

/** Little calendar block: SAT / 8 / NOV */
export function DateBadge({ value, tone = 'green' }: { value: string; tone?: 'green' | 'gold' }) {
  const b = badge(value);
  const bg = tone === 'gold' ? colors.marigoldSoft : colors.soft;
  const fg = tone === 'gold' ? colors.gold : colors.green;
  return (
    <View style={[s.box, { backgroundColor: bg }]}>
      <Text style={[s.small, { color: fg }]}>{b.dow}</Text>
      <Text style={[s.big, { color: fg }]}>{b.date}</Text>
      <Text style={[s.small, { color: fg }]}>{b.month}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { width: 54, paddingVertical: 8, borderRadius: 14, alignItems: 'center' },
  small: { ...font('700'), fontSize: 9, letterSpacing: 0.6 },
  big: { ...font('800'), fontSize: 20, marginVertical: -1 },
});
