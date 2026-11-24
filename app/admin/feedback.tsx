import { ItemCard } from '@/components/ItemCard';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { listFeedback, setFeedbackStatus, type Feedback } from '@/lib/api';
import { ago, flatOf } from '@/lib/format';
import { useLoad } from '@/lib/useLoad';

const look = {
  idea: { icon: 'bulb-outline', tint: 'gold', label: 'Idea' },
  problem: { icon: 'bug-outline', tint: 'rose', label: 'Problem' },
  praise: { icon: 'heart-outline', tint: 'green', label: 'Praise' },
} as const;

/** Super Admin: everything residents told us during the pilots, newest first. */
export default function FeedbackInbox() {
  const toast = useToast();
  const { data, error, loading, refreshing, refresh, reload } = useLoad(listFeedback);

  async function mark(f: Feedback, status: Feedback['status']) {
    try {
      await setFeedbackStatus(f.id, status);
      reload();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  const fresh = data?.filter((f) => f.status === 'new').length ?? 0;

  return (
    <Screen back title="Feedback" subtitle={`${fresh} new from pilot societies`} onRefresh={refresh} refreshing={refreshing}>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : !data!.length ? (
        <EmptyState icon="chatbox-ellipses-outline" title="No feedback yet" text="Residents send it from Profile → Send feedback." />
      ) : (
        data!.map((f) => {
          const l = look[f.kind];
          const who = [f.author?.full_name, flatOf(f.author ?? undefined), f.society?.name].filter(Boolean).join(' · ');
          return (
            <ItemCard
              key={f.id}
              icon={l.icon}
              tint={l.tint}
              title={f.message}
              subtitle={who}
              meta={ago(f.created_at)}
              right={<Pill label={f.status === 'new' ? 'New' : f.status === 'seen' ? 'Seen' : 'Done'} tone={f.status === 'new' ? 'gold' : f.status === 'done' ? 'green' : 'grey'} />}
              footer={
                f.status !== 'done' ? (
                  <Button
                    title={f.status === 'new' ? 'Mark as seen' : 'Mark as done'}
                    small
                    variant="secondary"
                    onPress={() => mark(f, f.status === 'new' ? 'seen' : 'done')}
                    full
                  />
                ) : null
              }
            />
          );
        })
      )}
    </Screen>
  );
}
