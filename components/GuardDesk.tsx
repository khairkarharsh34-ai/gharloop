import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { findVisitorByCode, listGateVisitors, setVisitorStatus, subscribeTable } from '@/lib/api';
import { iconForVisitor } from '@/lib/categories';
import { flatOf, time } from '@/lib/format';
import { colors, font } from '@/lib/theme';
import type { Visitor } from '@/lib/types';
import { useLoad } from '@/lib/useLoad';
import { Button } from './Button';
import { Card } from './Card';
import { EmergencyCalls } from './EmergencyCalls';
import { ItemCard } from './ItemCard';
import { Pill } from './Pill';
import { Section } from './Section';
import { EmptyState, ErrorState, Loading } from './States';
import { StepHeader } from './StepHeader';
import { useToast } from './Toast';
import { ErrorText } from './Typography';

/** Guard console: verify a 6-digit code, see who's expected / inside, check people in and out. Updates live. */
export function GuardDesk() {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [found, setFound] = useState<Visitor | null>(null);
  const [checkErr, setCheckErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { data, error, loading, reload } = useLoad(listGateVisitors);

  useEffect(() => subscribeTable('visitors', reload), [reload]);

  async function verify() {
    setCheckErr(null);
    setFound(null);
    if (!/^\d{6}$/.test(code)) return setCheckErr('Enter all 6 digits.');
    setBusy(true);
    try {
      const v = await findVisitorByCode(code);
      if (!v) setCheckErr('No active pass with this code. Call the resident before letting them in.');
      setFound(v);
    } catch (e) {
      setCheckErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function move(v: Visitor, status: 'inside' | 'left') {
    try {
      await setVisitorStatus(v.id, status);
      toast(status === 'inside' ? `${v.name} checked in` : `${v.name} checked out`);
      setFound(null);
      setCode('');
      reload();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  const expected = data?.filter((v) => v.status === 'expected') ?? [];
  const inside = data?.filter((v) => v.status === 'inside') ?? [];

  return (
    <View>
      <Card style={{ padding: 18, marginBottom: 12 }}>
        <Text style={{ ...font('800'), fontSize: 16, color: colors.ink }}>Emergency numbers</Text>
        <EmergencyCalls />
      </Card>
      <Card style={{ padding: 18 }}>
        <StepHeader n={1} title="Verify entry code" hint="Ask the visitor for their 6-digit code" />
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          placeholder="• • • • • •"
          placeholderTextColor={colors.faint}
          style={s.code}
          onSubmitEditing={verify}
          maxLength={6}
        />
        <Button title="Verify" icon="shield-checkmark-outline" onPress={verify} loading={busy} full />
        <ErrorText>{checkErr}</ErrorText>
        {found ? (
          <View style={s.found}>
            <Pill label="Valid pass ✓" tone="green" />
            <Text style={s.foundName}>{found.name}</Text>
            <Text style={s.foundMeta}>
              Visiting {found.resident?.full_name} · {flatOf(found.resident)} · expected {time(found.expected_at)}
            </Text>
            {found.status === 'expected' ? (
              <Button title="Allow entry" icon="enter-outline" onPress={() => move(found, 'inside')} full />
            ) : (
              <Button title="Mark exit" icon="exit-outline" variant="secondary" onPress={() => move(found, 'left')} full />
            )}
          </View>
        ) : null}
      </Card>

      <Section title={`Expected (${expected.length})`} />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : expected.length ? (
        expected.map((v) => (
          <ItemCard
            key={v.id}
            icon={iconForVisitor(v.purpose)}
            tint="blue"
            title={v.name}
            subtitle={`For ${v.resident?.full_name ?? 'resident'} · ${flatOf(v.resident)}`}
            meta={`Expected ${time(v.expected_at)} · code ${v.code}`}
            footer={<Button title="Check in" small icon="enter-outline" onPress={() => move(v, 'inside')} full style={{ marginTop: 10 }} />}
          />
        ))
      ) : (
        <EmptyState icon="people-outline" tint="slate" title="No one expected right now" text="Pre-approved visitors appear here as residents add them." />
      )}

      {inside.length ? <Section title={`Inside now (${inside.length})`} /> : null}
      {inside.map((v) => (
        <ItemCard
          key={v.id}
          icon={iconForVisitor(v.purpose)}
          tint="green"
          title={v.name}
          subtitle={`At ${flatOf(v.resident)} · since ${v.entered_at ? time(v.entered_at) : '—'}`}
          footer={<Button title="Check out" small variant="secondary" icon="exit-outline" onPress={() => move(v, 'left')} full style={{ marginTop: 10 }} />}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  code: {
    ...font('800'),
    fontSize: 32,
    letterSpacing: 10,
    textAlign: 'center',
    color: colors.ink,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 14,
    backgroundColor: colors.field,
    outlineStyle: 'none' as never,
  },
  found: { marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: colors.soft, gap: 4 },
  foundName: { ...font('800'), fontSize: 20, color: colors.ink, marginTop: 6 },
  foundMeta: { ...font('400'), fontSize: 13, color: colors.ink2 },
});
