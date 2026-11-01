import { StyleSheet, Text, View } from 'react-native';
import { ago, flatOf } from '@/lib/format';
import { colors, font } from '@/lib/theme';
import type { Person } from '@/lib/types';

type Item = { id: string; note: string; created_at: string; author: Person };

/** Vertical history of what happened, newest last. */
export function Timeline({ items }: { items: Item[] }) {
  return (
    <View>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <View key={it.id} style={s.row}>
            <View style={s.rail}>
              <View style={[s.dot, last && s.dotLast]} />
              {!last ? <View style={s.line} /> : null}
            </View>
            <View style={s.body}>
              <Text style={s.note}>{it.note}</Text>
              <Text style={s.meta}>
                {[it.author?.full_name, flatOf(it.author), ago(it.created_at)].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 14, paddingTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.faint },
  dotLast: { backgroundColor: colors.green, width: 12, height: 12, borderRadius: 6 },
  line: { width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 3 },
  body: { flex: 1, paddingBottom: 16 },
  note: { ...font('600'), fontSize: 14, color: colors.ink, lineHeight: 20 },
  meta: { ...font('400'), fontSize: 12, color: colors.muted, marginTop: 2 },
});
