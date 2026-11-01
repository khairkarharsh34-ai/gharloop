import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

export type Step = { title: string; detail?: string; state: 'done' | 'current' | 'todo' };

/** Vertical progress tracker (like an order-tracking screen). */
export function Steps({ steps }: { steps: Step[] }) {
  return (
    <View>
      {steps.map((st, i) => (
        <View key={st.title} style={s.row}>
          <View style={s.rail}>
            <View style={[s.dot, st.state === 'done' && s.done, st.state === 'current' && s.current]}>
              {st.state === 'done' ? <Text style={s.tick}>✓</Text> : null}
              {st.state === 'current' ? <View style={s.inner} /> : null}
            </View>
            {i < steps.length - 1 ? <View style={[s.line, st.state === 'done' && s.lineDone]} /> : null}
          </View>
          <View style={s.body}>
            <Text style={[s.title, st.state === 'todo' && { color: colors.faint }]}>{st.title}</Text>
            {st.detail ? <Text style={s.detail}>{st.detail}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  rail: { alignItems: 'center', width: 26 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: colors.green, borderColor: colors.green },
  current: { borderColor: colors.marigold, backgroundColor: colors.marigoldSoft },
  inner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.marigold },
  tick: { color: colors.white, fontSize: 13, fontWeight: '900' },
  line: { width: 2, flex: 1, minHeight: 22, backgroundColor: colors.line, marginVertical: 3 },
  lineDone: { backgroundColor: colors.green },
  body: { flex: 1, paddingBottom: 20, paddingTop: 3 },
  title: { fontSize: 15, fontWeight: '700', color: colors.ink },
  detail: { fontSize: 13, color: colors.muted, marginTop: 2, lineHeight: 18 },
});
