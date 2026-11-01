import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/lib/theme';

/** Numbered heading inside a form card, e.g. "① About you". */
export function StepHeader({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <View style={s.row}>
      <View style={s.badge}>
        <Text style={s.n}>{n}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        {hint ? <Text style={s.hint}>{hint}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  badge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  n: { ...font('800'), color: colors.green, fontSize: 13 },
  title: { ...font('800'), fontSize: 16, color: colors.ink },
  hint: { ...font('400'), fontSize: 12, color: colors.muted, marginTop: 1 },
});
