import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { ItemCard } from '@/components/ItemCard';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { ErrorText, Fine } from '@/components/Typography';
import { createSociety, getPilotStats, type PilotStats } from '@/lib/api';
import { colors, font } from '@/lib/theme';
import { useLoad } from '@/lib/useLoad';

/** Super Admin: every society, how each pilot is going, and onboarding a new one. */
export default function Societies() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data, error: loadErr, loading, refreshing, refresh, reload } = useLoad(getPilotStats);

  async function add() {
    if (name.trim().length < 3 || city.trim().length < 2) return setError('Enter the society name and city.');
    setBusy(true);
    setError(null);
    try {
      await createSociety(name.trim(), city.trim());
      toast(`${name.trim()} created. Open it to share the invite and pick its admin.`);
      setName('');
      setCity('');
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const pilots = data?.filter((s) => s.is_listed) ?? [];
  const hidden = data?.filter((s) => !s.is_listed) ?? [];

  return (
    <Screen back title="Societies" subtitle="Pilots across Ghar Loop (Super Admin)" onRefresh={refresh} refreshing={refreshing}>
      <Card style={{ padding: 18 }}>
        <Text style={s.h}>Onboard a new society</Text>
        <Input label="Society name" value={name} onChangeText={setName} placeholder="Palm Residency" />
        <Input label="City / area" value={city} onChangeText={setCity} placeholder="Wakad, Pune" />
        <ErrorText>{error}</ErrorText>
        <Button title="Create society" icon="add" onPress={add} loading={busy} full style={{ marginTop: 12 }} />
      </Card>

      {loadErr ? (
        <ErrorState message={loadErr} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : !data!.length ? (
        <EmptyState icon="business-outline" title="No societies yet" text="Create the first pilot society above." />
      ) : (
        <>
          <Section title={`Live societies (${pilots.length})`} />
          {pilots.map((p) => <SocietyRow key={p.society_id} p={p} />)}
          {hidden.length ? <Section title={`Hidden from sign-up (${hidden.length})`} /> : null}
          {hidden.map((p) => <SocietyRow key={p.society_id} p={p} />)}
          <Fine>Activity counts are for the last 7 days. Health: green = active this week, amber = members but quiet, grey = not started.</Fine>
        </>
      )}
    </Screen>
  );
}

function SocietyRow({ p }: { p: PilotStats }) {
  const activity = p.issues_7d + p.notices_7d + p.messages_7d + p.visitors_7d;
  const health = activity > 0 ? { label: 'Active', tone: 'green' as const } : p.members > 1 ? { label: 'Quiet', tone: 'gold' as const } : { label: 'Not started', tone: 'grey' as const };
  return (
    <ItemCard
      icon="business-outline"
      tint="blue"
      title={p.name}
      subtitle={`${p.city} · code ${p.join_code}`}
      right={<Pill label={health.label} tone={health.tone} />}
      onPress={() => router.push({ pathname: '/admin/society/[id]', params: { id: p.society_id } })}
      footer={
        <View style={s.stats}>
          <Num n={p.members} label="members" />
          <Num n={p.pending} label="waiting" warn={p.pending > 0} />
          <Num n={activity} label="actions 7d" />
          <Num n={p.feedback_new} label="feedback" warn={p.feedback_new > 0} />
        </View>
      }
    />
  );
}

function Num({ n, label, warn }: { n: number; label: string; warn?: boolean }) {
  return (
    <View style={s.num}>
      <Text style={[s.n, warn && { color: colors.gold }]}>{n}</Text>
      <Text style={s.l}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  h: { ...font('800'), fontSize: 16, color: colors.ink },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  num: { alignItems: 'center', flex: 1 },
  n: { ...font('800'), fontSize: 18, color: colors.ink },
  l: { ...font('500'), fontSize: 11, color: colors.muted, marginTop: 1 },
});
