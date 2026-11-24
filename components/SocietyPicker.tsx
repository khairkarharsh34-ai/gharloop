import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { listSocieties, societyByCode } from '@/lib/api';
import { colors, radius, font } from '@/lib/theme';
import type { Society } from '@/lib/types';
import { Button } from './Button';
import { Input } from './Input';
import { EmptyState, ErrorState, Loading } from './States';

type Props = { value: string | null; onChange: (id: string) => void; initialCode?: string };

/** Lists real societies from Supabase so a new user can pick theirs. */
export function SocietyPicker({ value, onChange, initialCode }: Props) {
  const [items, setItems] = useState<Society[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [code, setCode] = useState(initialCode ?? '');
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const [invited, setInvited] = useState<Society | null>(null);

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

  // An invite code finds the society even when it is hidden from the list.
  const applyCode = useCallback(
    async (c: string) => {
      setCodeMsg(null);
      try {
        const soc = await societyByCode(c);
        if (!soc) return setCodeMsg('No society has that code. Check it with your committee.');
        setInvited(soc);
        onChange(soc.id);
      } catch (e) {
        setCodeMsg((e as Error).message);
      }
    },
    [onChange],
  );

  useEffect(() => {
    if (initialCode) applyCode(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  if (invited && invited.id === value)
    return (
      <View style={[s.gap, s.list]}>
        <View style={[s.item, s.on]}>
          <View style={[s.radio, s.radioOn]}><View style={s.dot} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{invited.name}</Text>
            <Text style={s.city}>{invited.city} · invited with code</Text>
          </View>
        </View>
        <Text style={s.change} onPress={() => { setInvited(null); setCode(''); }}>Not your society? Choose another</Text>
      </View>
    );

  if (error) return <View style={s.gap}><ErrorState message={error} onRetry={load} /></View>;
  if (!items) return <Loading label="Loading societies…" />;
  if (!items.length)
    return <View style={s.gap}><EmptyState icon="business-outline" title="No societies yet" text="Ask the Ghar Loop team to add your society first." /></View>;

  const q = search.trim().toLowerCase();
  const shown = q ? items.filter((soc) => `${soc.name} ${soc.city}`.toLowerCase().includes(q)) : items;

  return (
    <View style={[s.gap, s.list]}>
      <View style={s.codeRow}>
        <View style={{ flex: 1 }}>
          <Input label="Society code (from your committee)" value={code} onChangeText={(t) => setCode(t.toUpperCase())} autoCapitalize="characters" maxLength={6} placeholder="ABC234" />
        </View>
        <Button title="Use" small variant="secondary" onPress={() => applyCode(code)} disabled={code.trim().length < 6} style={{ marginBottom: 2 }} />
      </View>
      {codeMsg ? <Text style={s.msg}>{codeMsg}</Text> : null}
      <Text style={s.or}>or find it in the list</Text>
      {items.length > 5 ? <Input value={search} onChangeText={setSearch} placeholder="Search society or area" /> : null}
      {!shown.length ? <Text style={s.msg}>No match. Try the society code instead.</Text> : null}
      {shown.map((soc) => {
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
  codeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: -14 },
  or: { ...font('600'), fontSize: 12, color: colors.muted, textAlign: 'center', marginVertical: 4 },
  msg: { ...font('500'), fontSize: 13, color: colors.red },
  change: { ...font('700'), fontSize: 13, color: colors.green, textAlign: 'center', marginTop: 6 },
});
