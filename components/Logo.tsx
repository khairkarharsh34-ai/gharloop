import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

/** Marigold "प" mark + padosi wordmark (white, for green backgrounds). */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <View style={s.row}>
      <View style={[s.mark, { width: size, height: size, borderRadius: size * 0.33 }]}>
        <Text style={[s.letter, { fontSize: size * 0.55 }]}>प</Text>
      </View>
      <Text style={[s.word, { fontSize: size * 0.55 }]}>padosi</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { backgroundColor: colors.marigold, alignItems: 'center', justifyContent: 'center' },
  letter: { color: colors.greenDark, fontWeight: '900', marginTop: -2 },
  word: { color: colors.white, fontWeight: '800', letterSpacing: -0.5 },
});
