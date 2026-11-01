import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card, Divider, Row } from '@/components/Card';
import { DateBadge } from '@/components/DateBadge';
import { Pill } from '@/components/Pill';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { Fine } from '@/components/Typography';
import { getActivity, joinActivity, leaveActivity, payAndJoin, setActivityStatus } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { flatOf, when } from '@/lib/format';
import { activityStatus } from '@/lib/status';
import { colors, font } from '@/lib/theme';
import { isAdmin, type ActivityStatus } from '@/lib/types';
import { useLoad } from '@/lib/useLoad';

export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const { data: a, error, loading, refreshing, refresh, reload } = useLoad(() => getActivity(id), [id]);

  async function act(key: string, fn: () => Promise<unknown>, done: string) {
    setBusy(key);
    try {
      await fn();
      toast(done);
      reload();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (error) return <Screen back title="Activity"><ErrorState message={error} onRetry={reload} /></Screen>;
  if (loading) return <Screen back><Loading /></Screen>;
  const act0 = a!;
  const joined = act0.activity_joins.length;
  const mine = act0.activity_joins.some((j) => j.user_id === profile?.id);
  const full = act0.capacity !== null && joined >= act0.capacity;
  const organiser = act0.created_by === profile?.id;
  const admin = isAdmin(profile?.role);
  const st = activityStatus[act0.status];
  const setStatus = (s: ActivityStatus, msg: string) => act(s, () => setActivityStatus(act0.id, s), msg);

  return (
    <Screen back onRefresh={refresh} refreshing={refreshing}>
      <Card style={{ padding: 18 }}>
        <Row style={{ alignItems: 'flex-start' }}>
          <DateBadge value={act0.starts_at} tone={act0.price ? 'gold' : 'green'} />
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Pill label={act0.price ? `₹${act0.price} / person` : 'FREE'} tone={act0.price ? 'gold' : 'green'} />
            <Pill label={st.label} tone={st.tone} />
          </View>
        </Row>
        <Text style={s.title}>{act0.title}</Text>
        <Text style={s.meta}>Hosted by {[act0.author?.full_name, flatOf(act0.author)].filter(Boolean).join(' · ')}</Text>
        {act0.description ? <Text style={s.body}>{act0.description}</Text> : null}
        <Divider />
        <Row style={{ paddingVertical: 3 }}>
          <Text style={s.label}>When</Text>
          <Text style={s.value}>{when(act0.starts_at)}</Text>
        </Row>
        <Row style={{ paddingVertical: 3 }}>
          <Text style={s.label}>Where</Text>
          <Text style={s.value}>{act0.location || 'To be shared'}</Text>
        </Row>
        <Row style={{ paddingVertical: 3 }}>
          <Text style={s.label}>Spots</Text>
          <Text style={s.value}>{act0.capacity ? `${joined} of ${act0.capacity} taken` : `${joined} joined`}</Text>
        </Row>
        {act0.capacity ? <ProgressBar value={joined / act0.capacity} color={full ? colors.red : colors.green} /> : null}

        {act0.status === 'live' ? (
          mine ? (
            <Button title="You're in ✓  Leave" variant="secondary" onPress={() => act('leave', () => leaveActivity(act0.id), 'You left the activity')} loading={busy === 'leave'} full style={{ marginTop: 18 }} />
          ) : full ? (
            <Button title="Activity is full" disabled full style={{ marginTop: 18 }} />
          ) : act0.price ? (
            <Button title={`Pay ₹${act0.price} (test) & join`} icon="card-outline" onPress={() => act('pay', () => payAndJoin(act0), 'Payment recorded (test). See you there!')} loading={busy === 'pay'} full style={{ marginTop: 18 }} />
          ) : (
            <Button title="Join" icon="add-circle-outline" onPress={() => act('join', () => joinActivity(act0.id), 'Joined! See you there 🎉')} loading={busy === 'join'} full style={{ marginTop: 18 }} />
          )
        ) : null}
        {act0.price && act0.status === 'live' && !mine ? <Fine>Test mode: no real money is charged, a payment record is saved.</Fine> : null}
      </Card>

      {admin && act0.status === 'pending' ? (
        <>
          <Section title="Admin review" />
          <Card style={{ padding: 18 }}>
            <Text style={s.body}>Check the price (₹{act0.price}), timing and safety (e.g. children's activities need a guardian).</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button title="Reject" variant="danger" onPress={() => setStatus('rejected', 'Rejected')} loading={busy === 'rejected'} style={{ flex: 1 }} />
              <Button title="Approve" onPress={() => setStatus('live', 'Approved and published')} loading={busy === 'live'} style={{ flex: 1 }} />
            </View>
          </Card>
        </>
      ) : null}

      {(organiser || admin) && (act0.status === 'live' || act0.status === 'pending') ? (
        <Button title="Cancel this activity" variant="ghost" onPress={() => setStatus('cancelled', 'Activity cancelled')} loading={busy === 'cancelled'} full />
      ) : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  title: { ...font('800'), fontSize: 24, color: colors.ink, marginTop: 14, letterSpacing: -0.5 },
  meta: { ...font('500'), fontSize: 13, color: colors.muted, marginTop: 4 },
  body: { ...font('400'), fontSize: 15, color: colors.ink2, marginTop: 12, lineHeight: 22 },
  label: { ...font('400'), fontSize: 14, color: colors.muted },
  value: { ...font('600'), fontSize: 14, color: colors.ink },
});
