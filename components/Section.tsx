import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

/** Bold section heading, e.g. "Your community". Optional right-side element. */
export function Section({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={s.row}>
      <Text style={s.title}>{title}</Text>
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 9,
    marginHorizontal: 2,
  },
  title: { fontSize: 15, fontWeight: '800', color: colors.ink },
});
