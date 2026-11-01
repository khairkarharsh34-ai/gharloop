import { router } from 'expo-router';
import { ActivityCard } from '@/components/ActivityCard';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { Fine } from '@/components/Typography';
import { listActivities } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLoad } from '@/lib/useLoad';

export default function ActivitiesTab() {
  const { profile } = useAuth();
  const { data, error, loading, refreshing, refresh, reload } = useLoad(listActivities);
  const live = data?.filter((a) => a.status === 'live') ?? [];
  const free = live.filter((a) => !a.price);
  const paid = live.filter((a) => a.price > 0);
  const pending = data?.filter((a) => a.status === 'pending' || a.status === 'rejected') ?? [];

  return (
    <Screen
      title="Activities"
      subtitle="Community-led first. Join in one tap."
      right={<Button small icon="add" title="Create" onPress={() => router.push('/activities/new')} />}
      onRefresh={refresh}
      refreshing={refreshing}
    >
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : !data!.length ? (
        <EmptyState
          icon="bicycle-outline"
          tint="orange"
          title="Nothing planned yet"
          text="Start a yoga session, a cricket match or a workshop. Free activities go live instantly."
          action={{ title: 'Create an activity', onPress: () => router.push('/activities/new') }}
        />
      ) : (
        <>
          {free.length ? <Section title="Free · resident-led" /> : null}
          {free.map((a) => <ActivityCard key={a.id} activity={a} me={profile?.id} />)}
          {paid.length ? <Section title="Paid workshops" /> : null}
          {paid.map((a) => <ActivityCard key={a.id} activity={a} me={profile?.id} />)}
          {pending.length ? <Section title="Awaiting approval" /> : null}
          {pending.map((a) => <ActivityCard key={a.id} activity={a} me={profile?.id} />)}
        </>
      )}
      <Fine>Free activities publish instantly. Paid ones get a quick safety and pricing check by your admin first.</Fine>
    </Screen>
  );
}
