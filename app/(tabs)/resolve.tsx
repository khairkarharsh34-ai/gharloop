import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { IssueCard, isOverdue } from '@/components/IssueCard';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { Fine } from '@/components/Typography';
import { listIssues } from '@/lib/api';
import { useLoad } from '@/lib/useLoad';

type Filter = 'active' | 'resolved' | 'all';

export default function ResolveTab() {
  const [filter, setFilter] = useState<Filter>('active');
  const { data, error, loading, refreshing, refresh, reload } = useLoad(() => listIssues(filter), [filter]);
  const overdue = data?.filter(isOverdue).length ?? 0;

  return (
    <Screen
      title="Resolve"
      subtitle={overdue ? `${overdue} overdue · every issue has an owner and a deadline` : 'One issue, one owner, one deadline, one visible status.'}
      right={<Button small icon="add" title="Report" onPress={() => router.push('/resolve/new')} />}
      onRefresh={refresh}
      refreshing={refreshing}
    >
      <Segmented
        options={[
          { key: 'active', label: 'Open' },
          { key: 'resolved', label: 'Resolved' },
          { key: 'all', label: 'All' },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : !data!.length ? (
        <EmptyState
          icon="checkmark-done-outline"
          title={filter === 'resolved' ? 'Nothing resolved yet' : 'No open issues 🎉'}
          text="Spot a problem? Report it with a photo and it gets an owner and a deadline."
          action={{ title: 'Report an issue', onPress: () => router.push('/resolve/new') }}
        />
      ) : (
        data!.map((i) => <IssueCard key={i.id} issue={i} />)
      )}
      <Fine>Issues can only be closed with a photo of the fix, so "resolved" always means resolved.</Fine>
    </Screen>
  );
}
