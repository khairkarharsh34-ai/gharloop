import { router } from 'expo-router';
import { HelpCard } from '@/components/HelpCard';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { Grid, Tile } from '@/components/Tile';
import { listHelp } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { helpCategories } from '@/lib/categories';
import { isAdmin } from '@/lib/types';
import { useLoad } from '@/lib/useLoad';

export default function NeedHelp() {
  const { profile } = useAuth();
  const admin = isAdmin(profile?.role);
  const { data, error, loading, refreshing, refresh, reload } = useLoad(listHelp);
  const active = data?.filter((r) => r.status === 'open' || r.status === 'assigned') ?? [];
  const past = data?.filter((r) => r.status === 'done' || r.status === 'cancelled') ?? [];

  return (
    <Screen back title="Need Help" subtitle="What do you need help with?" onRefresh={refresh} refreshing={refreshing}>
      <Grid>
        {helpCategories.map((c) => (
          <Tile key={c.value} icon={c.icon} tint={c.tint} title={c.label} subtitle={c.sub} onPress={() => router.push({ pathname: '/help/new', params: { category: c.value } })} />
        ))}
      </Grid>

      <Section title={admin ? 'Requests from residents' : 'Your requests'} />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : !data!.length ? (
        <EmptyState icon="hand-left-outline" tint="rose" title="No requests yet" text="Pick a service above. Your request gets an owner and is tracked until it's done." />
      ) : (
        <>
          {active.map((r) => <HelpCard key={r.id} req={r} admin={admin} mine={r.user_id === profile?.id} onChanged={reload} />)}
          {past.length ? <Section title="Done & cancelled" /> : null}
          {past.map((r) => <HelpCard key={r.id} req={r} admin={admin} mine={r.user_id === profile?.id} onChanged={reload} />)}
        </>
      )}
    </Screen>
  );
}
