import { router } from 'expo-router';
import { getHomeFeed } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { when } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';
import { ActivityCard } from './ActivityCard';
import { IssueCard } from './IssueCard';
import { ItemCard } from './ItemCard';
import { Section } from './Section';
import { EmptyState, ErrorState, Loading } from './States';

/** "This week" on Home: latest notice, open issues, next activities. Real data only. */
export function HomeFeed({ reloadKey }: { reloadKey: number }) {
  const { profile } = useAuth();
  const { data, error, loading, reload } = useLoad(getHomeFeed, [reloadKey]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading) return <Loading />;
  const { issues, activities, notices } = data!;
  if (!issues.length && !activities.length && !notices.length) {
    return (
      <EmptyState
        icon="calendar-outline"
        tint="orange"
        title="A quiet week so far"
        text="Open issues, upcoming activities and society notices will appear here."
      />
    );
  }
  const n = notices[0];
  return (
    <>
      {n ? (
        <ItemCard
          icon="megaphone-outline"
          tint="purple"
          title={n.title}
          subtitle={n.body ?? undefined}
          meta={n.event_at ? `${when(n.event_at)}${n.location ? ' · ' + n.location : ''} · ${n.rsvps.length} going` : 'Notice from your admin'}
          onPress={() => router.push('/community')}
        />
      ) : null}
      {issues.length ? <Section title="Open issues" action={{ label: 'See all', onPress: () => router.push('/resolve') }} /> : null}
      {issues.map((i) => <IssueCard key={i.id} issue={i} />)}
      {activities.length ? <Section title="Coming up" action={{ label: 'See all', onPress: () => router.push('/activities') }} /> : null}
      {activities.map((a) => <ActivityCard key={a.id} activity={a} me={profile?.id} />)}
    </>
  );
}
