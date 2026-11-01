import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { listSocieties } from '@/lib/api';
import { colors, radius, font } from '@/lib/theme';
import type { Society } from '@/lib/types';
import { EmptyState, ErrorState, Loading } from './States';

type Props = { value: string | null; onChange: (id: string) => void };

/** Lists real societies from Supabase so a new user can pick theirs. */
export function SocietyPicker({ value, onChange }: Props) {
  const [items, setItems] = useState<Society[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setItems(null);
    try {
      setItems(await listSocieties());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <View style={s.gap}><ErrorState message={error} onRetry={load} /></View>;
  if (!items) return <Loading label="Loading societies…" />;
  if (!items.length)
    return <View style={s.gap}><EmptyState icon="business-outline" title="No societies yet" text="Ask the Padosi team to add your society first." /></View>;

  return (
    <View style={[s.gap, s.list]}>
      {items.map((soc) => {
        const on = soc.id === value;
        return (
          <Pressable key={soc.id} onPress={() => onChange(soc.id)} style={[s.item, on && s.on]}>
            <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.dot} /> : null}</View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{soc.name}</Text>
              <Text style={s.city}>{soc.city}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  gap: { marginTop: 14 },
  list: { gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.field,
    padding: 14,
    backgroundColor: colors.field,
  },
  on: { borderColor: colors.green, backgroundColor: colors.soft },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.green },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green },
  name: { ...font('700'), fontSize: 15, color: colors.ink },
  city: { ...font('400'), fontSize: 12, color: colors.muted, marginTop: 1 },
});
