import { router } from 'expo-router';
import { View } from 'react-native';
import { iconForIssue } from '@/lib/categories';
import { ago, flatOf, isoDate, shortDate } from '@/lib/format';
import { issueStatus } from '@/lib/status';
import type { Issue } from '@/lib/types';
import { ItemCard } from './ItemCard';
import { Pill } from './Pill';

export const isOverdue = (i: Issue) => i.status !== 'resolved' && !!i.due_date && i.due_date < isoDate(new Date());

/** One issue in a list: category icon, title, owner + deadline, status. */
export function IssueCard({ issue }: { issue: Issue }) {
  const st = issueStatus[issue.status];
  const owner = issue.owner_name ? `Owner: ${issue.owner_name}` : 'No owner yet';
  const due = issue.due_date ? ` · Due ${shortDate(issue.due_date)}` : '';
  return (
    <ItemCard
      icon={iconForIssue(issue.category)}
      tint={issue.status === 'resolved' ? 'green' : issue.priority === 'high' ? 'rose' : 'blue'}
      title={issue.title}
      subtitle={owner + due}
      meta={[issue.author?.full_name, flatOf(issue.author), ago(issue.created_at)].filter(Boolean).join(' · ')}
      right={
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Pill label={st.label} tone={st.tone} />
          {isOverdue(issue) ? <Pill label="Overdue" tone="red" /> : null}
        </View>
      }
      onPress={() => router.push(`/resolve/${issue.id}`)}
    />
  );
}
