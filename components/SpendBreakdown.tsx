import { StyleSheet, Text, View } from 'react-native';
import { rupees } from '@/lib/format';
import { colors, font } from '@/lib/theme';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';

/** Horizontal bars: where this month's money went. */
export function SpendBreakdown({ items }: { items: { category: string; amount: number }[] }) {
  const max = Math.max(...items.map((i) => i.amount), 1);
  return (
    <Card style={{ padding: 18 }}>
      {items.map((i) => (
        <View key={i.category} style={s.row}>
          <View style={s.top}>
            <Text style={s.cat}>{i.category}</Text>
            <Text style={s.amt}>{rupees(i.amount)}</Text>
          </View>
          <ProgressBar value={i.amount / max} color={colors.marigold} />
        </View>
      ))}
    </Card>
  );
}

const s = StyleSheet.create({
  row: { marginBottom: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  cat: { ...font('600'), fontSize: 14, color: colors.ink },
  amt: { ...font('700'), fontSize: 14, color: colors.ink },
});
