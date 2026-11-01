import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card, Divider, Row } from '@/components/Card';
import { IconChip } from '@/components/IconChip';
import { IssueAdminPanel } from '@/components/IssueAdminPanel';
import { isOverdue } from '@/components/IssueCard';
import { Input } from '@/components/Input';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { ErrorState, Loading } from '@/components/States';
import { Timeline } from '@/components/Timeline';
import { useToast } from '@/components/Toast';
import { addIssueComment, getIssue, listIssueUpdates } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { iconForIssue, issueCategories } from '@/lib/categories';
import { ago, flatOf, shortDate } from '@/lib/format';
import { issueStatus, priorityPill } from '@/lib/status';
import { colors, font } from '@/lib/theme';
import { isAdmin } from '@/lib/types';
import { useLoad } from '@/lib/useLoad';

export default function IssueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const toast = useToast();
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const { data, error, loading, refreshing, refresh, reload } = useLoad(
    async () => ({ issue: await getIssue(id), updates: await listIssueUpdates(id) }),
    [id],
  );

  async function send() {
    if (!comment.trim()) return;
    setSending(true);
    try {
      await addIssueComment(id, comment.trim());
      setComment('');
      reload();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (error) return <Screen back title="Issue"><ErrorState message={error} onRetry={reload} /></Screen>;
  if (loading) return <Screen back><Loading /></Screen>;
  const { issue, updates } = data!;
  const st = issueStatus[issue.status];
  const cat = issueCategories.find((c) => c.value === issue.category)?.label ?? 'Other';

  return (
    <Screen back onRefresh={refresh} refreshing={refreshing}>
      <Card style={{ padding: 18 }}>
        <Row style={{ alignItems: 'flex-start' }}>
          <IconChip icon={iconForIssue(issue.category)} tint={issue.status === 'resolved' ? 'green' : 'blue'} size={48} />
          <View style={s.pills}>
            <Pill label={st.label} tone={st.tone} />
            {isOverdue(issue) ? <Pill label="Overdue" tone="red" /> : null}
          </View>
        </Row>
        <Text style={s.title}>{issue.title}</Text>
        <Text style={s.meta}>
          {cat} · {[issue.author?.full_name, flatOf(issue.author)].filter(Boolean).join(' · ')} · {ago(issue.created_at)}
        </Text>
        {issue.description ? <Text style={s.body}>{issue.description}</Text> : null}
        {issue.photo_url ? <Image source={{ uri: issue.photo_url }} style={s.photo} /> : null}
        <Divider />
        <Fact label="Owner" value={issue.owner_name ?? 'Not assigned yet'} muted={!issue.owner_name} />
        <Fact label="Deadline" value={issue.due_date ? shortDate(issue.due_date) : 'Not set'} muted={!issue.due_date} />
        <Fact label="Priority" value={priorityPill[issue.priority].label} />
      </Card>

      {issue.proof_url ? (
        <>
          <Section title="Proof of fix" />
          <Card>
            <Image source={{ uri: issue.proof_url }} style={[s.photo, { marginTop: 0 }]} />
          </Card>
        </>
      ) : null}

      {isAdmin(profile?.role) ? (
        <>
          <Section title="Manage" />
          <IssueAdminPanel issue={issue} onChanged={reload} />
        </>
      ) : null}

      <Section title="Timeline" />
      <Card style={{ padding: 18, paddingBottom: 4 }}>
        <Timeline items={updates} />
      </Card>
      <Card>
        <Input value={comment} onChangeText={setComment} placeholder="Add an update or comment…" multiline style={{ marginTop: -14 }} />
        <Button title="Post update" icon="chatbubble-outline" variant="secondary" small onPress={send} loading={sending} disabled={!comment.trim()} full />
      </Card>
    </Screen>
  );
}

function Fact({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <Row style={{ paddingVertical: 4 }}>
      <Text style={s.factLabel}>{label}</Text>
      <Text style={[s.factValue, muted && { color: colors.faint }]}>{value}</Text>
    </Row>
  );
}

const s = StyleSheet.create({
  pills: { alignItems: 'flex-end', gap: 6 },
  title: { ...font('800'), fontSize: 22, color: colors.ink, marginTop: 14, letterSpacing: -0.4 },
  meta: { ...font('400'), fontSize: 13, color: colors.muted, marginTop: 4 },
  body: { ...font('400'), fontSize: 15, color: colors.ink2, marginTop: 12, lineHeight: 22 },
  photo: { width: '100%', height: 220, borderRadius: 14, marginTop: 14, backgroundColor: colors.line },
  factLabel: { ...font('400'), fontSize: 14, color: colors.muted },
  factValue: { ...font('600'), fontSize: 14, color: colors.ink, flexShrink: 1, textAlign: 'right' },
});
