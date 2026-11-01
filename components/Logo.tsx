import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/lib/theme';

/** Marigold "घ" mark + "gharloop" wordmark (for green backgrounds). */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <View style={s.row}>
      <View style={[s.mark, { width: size, height: size, borderRadius: size * 0.33 }]}>
        <Text style={[s.letter, { fontSize: size * 0.58 }]}>घ</Text>
      </View>
      <Text style={[s.word, { fontSize: size * 0.55 }]}>
        ghar<Text style={s.loop}>loop</Text>
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { backgroundColor: colors.marigold, alignItems: 'center', justifyContent: 'center' },
  // Devanagari letter: Inter has no Devanagari, so this one uses the system font.
  letter: { color: colors.greenDark, fontWeight: '900', marginTop: -2 },
  word: { ...font('800'), color: colors.white, letterSpacing: -0.5 },
  loop: { color: colors.marigold },
});
