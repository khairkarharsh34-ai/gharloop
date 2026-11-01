import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { listSocieties } from '@/lib/api';
import { colors, radius } from '@/lib/theme';
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

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items) return <Loading label="Loading societies…" />;
  if (!items.length)
    return <EmptyState icon="🏘️" title="No societies yet" text="Ask the Padosi team to add your society first." />;

  return (
    <View style={s.list}>
      {items.map((soc) => {
        const on = soc.id === value;
        return (
          <Pressable key={soc.id} onPress={() => onChange(soc.id)} style={[s.item, on && s.on]}>
            <Text style={[s.name, on && { color: colors.green }]}>{on ? '✓ ' : ''}{soc.name}</Text>
            <Text style={s.city}>{soc.city}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  list: { gap: 6, marginTop: 6 },
  item: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.button, padding: 11, backgroundColor: colors.white },
  on: { borderColor: colors.green, backgroundColor: colors.soft },
  name: { fontSize: 13, fontWeight: '800', color: colors.ink },
  city: { fontSize: 11, color: colors.muted },
});
