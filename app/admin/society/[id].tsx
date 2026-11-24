import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Card } from '@/components/Card';
import { InviteCard } from '@/components/InviteCard';
import { JoinRequests } from '@/components/JoinRequests';
import { LinkRow } from '@/components/LinkRow';
import { MaintenanceSetting } from '@/components/MaintenanceSetting';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Stat, StatGrid } from '@/components/Stat';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { Fine } from '@/components/Typography';
import { getPilotStats, setSocietyListed } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useLoad } from '@/lib/useLoad';

/** Super Admin: one pilot society — invite, approvals, first admin, settings and activity. */
export default function SocietyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const toast = useToast();
  const [reloadKey, setReloadKey] = useState(0);
  const { data, error, loading, refreshing, refresh, reload } = useLoad(
    async () => (await getPilotStats()).find((s) => s.society_id === id) ?? null,
    [id],
  );

  const pull = () => {
    setReloadKey((k) => k + 1);
    refresh();
  };

  async function toggleListed() {
    if (!data) return;
    try {
      await setSocietyListed(id, !data.is_listed);
      toast(data.is_listed ? 'Hidden from the sign-up list' : 'Shown in the sign-up list');
      reload();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  if (error) return <Screen back title="Society"><ErrorState message={error} onRetry={reload} /></Screen>;
  if (loading) return <Loading />;
  if (!data) return <Screen back title="Society"><EmptyState icon="business-outline" title="Society not found" /></Screen>;

  const activity = data.issues_7d + data.notices_7d + data.messages_7d + data.visitors_7d;

  return (
    <Screen back title={data.name} subtitle={`${data.city} · code ${data.join_code}`} onRefresh={pull} refreshing={refreshing}>
      <StatGrid>
        <Stat value={String(data.members)} label="Members" icon="people-outline" tint="green" />
        <Stat value={String(data.pending)} label="Waiting for approval" icon="time-outline" tint="gold" alert={data.pending > 0} />
        <Stat value={String(activity)} label="Actions in 7 days" icon="pulse-outline" tint="blue" />
        <Stat value={String(data.open_issues)} label="Open issues" icon="construct-outline" tint="rose" />
      </StatGrid>

      {data.admins === 0 ? (
        <Fine>No Society Admin yet. Approve the committee member below, then open Members and make them Admin.</Fine>
      ) : null}

      <Section title="Invite" />
      <InviteCard societyId={id} societyName={data.name} />

      <Section title="Waiting for approval" />
      <JoinRequests me={profile!} reloadKey={reloadKey} societyId={id} />

      <Section title="Manage" />
      <Card style={{ paddingVertical: 4 }}>
        <LinkRow
          icon="people-outline"
          tint="green"
          title="Members & roles"
          subtitle={`${data.admins} admin · ${data.guards} guards`}
          onPress={() => router.push({ pathname: '/admin/members', params: { society: id } })}
        />
        <LinkRow
          icon={data.is_listed ? 'eye-off-outline' : 'eye-outline'}
          tint="slate"
          title={data.is_listed ? 'Hide from sign-up list' : 'Show in sign-up list'}
          subtitle={data.is_listed ? 'Residents can still join with the invite link' : 'Hidden: only the invite link works'}
          onPress={toggleListed}
          last
        />
      </Card>

      <Section title="Settings" />
      <MaintenanceSetting key={data.maintenance_amount} societyId={id} amount={data.maintenance_amount} onSaved={reload} />
    </Screen>
  );
}
