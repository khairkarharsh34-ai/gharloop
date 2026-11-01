import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { GuardDesk } from '@/components/GuardDesk';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Segmented } from '@/components/Segmented';
import { SosButton } from '@/components/SosButton';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { VisitorPass } from '@/components/VisitorPass';
import { listMyVisitors, setVisitorStatus } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { isAdmin } from '@/lib/types';
import { useLoad } from '@/lib/useLoad';

export default function Gate() {
  const { profile } = useAuth();
  const guard = profile?.role === 'guard';
  const admin = isAdmin(profile?.role);
  const [view, setView] = useState<'mine' | 'desk'>(guard ? 'desk' : 'mine');

  return (
    <Screen
      back
      title={guard ? 'Gate desk' : 'Gate & Visitors'}
      subtitle={guard ? 'Verify codes and log every entry.' : 'Pre-approve guests and reach security fast.'}
      right={view === 'mine' ? <Button small icon="add" title="Visitor" onPress={() => router.push('/gate/new')} /> : undefined}
    >
      {admin ? (
        <Segmented
          options={[
            { key: 'mine', label: 'My visitors' },
            { key: 'desk', label: 'Gate desk' },
          ]}
          value={view}
          onChange={setView}
        />
      ) : null}
      {view === 'desk' ? <GuardDesk /> : <ResidentGate />}
    </Screen>
  );
}

function ResidentGate() {
  const toast = useToast();
  const { data, error, loading, reload } = useLoad(listMyVisitors);
  const upcoming = data?.filter((v) => v.status === 'expected' || v.status === 'inside') ?? [];
  const past = data?.filter((v) => v.status === 'left' || v.status === 'cancelled').slice(0, 5) ?? [];

  async function cancel(id: string) {
    try {
      await setVisitorStatus(id, 'cancelled');
      toast('Pass cancelled');
      reload();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  return (
    <>
      <SosButton onSent={reload} />
      <Section title="Your visitor passes" />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : upcoming.length ? (
        upcoming.map((v) => <VisitorPass key={v.id} v={v} onCancel={v.status === 'expected' ? () => cancel(v.id) : undefined} />)
      ) : (
        <EmptyState
          icon="person-add-outline"
          tint="slate"
          title="No visitors expected"
          text="Pre-approve a guest, delivery or service visit. They get a 6-digit code, and the guard lets them in without calling you."
          action={{ title: 'Pre-approve a visitor', onPress: () => router.push('/gate/new') }}
        />
      )}
      {past.length ? <Section title="Recent" /> : null}
      {past.map((v) => <VisitorPass key={v.id} v={v} />)}
    </>
  );
}
