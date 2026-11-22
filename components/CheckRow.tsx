import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/lib/theme';
import { Icon } from './Icon';

/** A tappable checkbox with a label (the label can contain links). */
export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <Pressable onPress={() => onChange(!checked)} style={s.row} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <View style={[s.box, checked && s.on]}>{checked ? <Icon name="checkmark" size={16} color={colors.white} /> : null}</View>
      <Text style={s.text}>{children}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 14 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: '#c9d3cd', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, marginTop: 1 },
  on: { backgroundColor: colors.green, borderColor: colors.green },
  text: { ...font('400'), flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.ink2 },
});
