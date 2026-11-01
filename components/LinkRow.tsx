import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '@/lib/theme';

/** Card-style row with a chevron, e.g. "Privacy policy & data ›" */
export function LinkRow({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.row, pressed && { opacity: 0.75 }]}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.chev}>›</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink, flex: 1 },
  chev: { fontSize: 18, color: colors.muted },
});
