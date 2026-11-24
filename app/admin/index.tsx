import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityCard } from '@/components/ActivityCard';
import { BusinessCard } from '@/components/BusinessCard';
import { Card } from '@/components/Card';
import { JoinRequests } from '@/components/JoinRequests';
import { LinkRow } from '@/components/LinkRow';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { Stat, StatGrid } from '@/components/Stat';
import { ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { getAdminStats, getMaintenanceAmount, listActivities, listBusinesses, setBusinessStatus } from '@/lib/api';
import { InviteCard } from '@/components/InviteCard';
import { MaintenanceSetting } from '@/components/MaintenanceSetting';
import { useAuth } from '@/lib/auth';
import { useLoad } from '@/lib/useLoad';

export default function AdminHome() {
  const { profile } = useAuth();
  const toast = useToast();
  const [reloadKey, setReloadKey] = useState(0);
  const sid = profile?.society_id ?? '';
  const { data, error, loading, refreshing, refresh, reload } = useLoad(async () => {
    if (!sid) return null;
    const [stats, activities, businesses, amount] = await Promise.all([
      getAdminStats(sid),
      listActivities(),
      listBusinesses(),
      getMaintenanceAmount(sid),
    ]);
    return {
      stats,
      amount,
      activities: activities.filter((a) => a.status === 'pending'),
      businesses: businesses.filter((b) => b.status === 'pending'),
    };
  }, [sid]);

  // A Super Admin who isn't part of a society manages the whole platform instead.
  if (!sid && profile?.role === 'super_admin') return <Redirect href="/admin/societies" />;

  const pull = () => {
    setReloadKey((k) => k + 1);
    refresh();
  };
  const st = data?.stats;
  const approvals = st ? st.joinRequests + st.pendingActivities + st.pendingBusinesses : 0;

  return (
    <Screen back title="Admin" subtitle={profile?.society?.name ?? 'Committee dashboard'} onRefresh={pull} refreshing={refreshing}>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : (
        <>
          <StatGrid>
            <Stat value={String(st!.residents)} label="Residents" icon="people-outline" tint="green" onPress={() => router.push('/admin/members')} />
            <Stat value={String(st!.openIssues)} label="Open issues" icon="construct-outline" tint="blue" alert={st!.openIssues > 0} onPress={() => router.push('/resolve')} />
            <Stat value={String(approvals)} label="Waiting for approval" icon="checkmark-done-outline" tint="gold" alert={approvals > 0} />
            <Stat value={String(st!.openHelp)} label="Open help requests" icon="hand-left-outline" tint="rose" alert={st!.openHelp > 0} onPress={() => router.push('/help')} />
          </StatGrid>

          <Section title="Invite residents" />
          <InviteCard societyId={sid} societyName={profile?.society?.name ?? 'Our society'} />

          <Section title="Resident requests" />
          <JoinRequests me={profile!} reloadKey={reloadKey} />

          {data!.activities.length ? <Section title="Paid activities to review" /> : null}
          {data!.activities.map((a) => <ActivityCard key={a.id} activity={a} />)}

          {data!.businesses.length ? <Section title="Businesses to review" /> : null}
          {data!.businesses.map((b) => (
            <BusinessCard
              key={b.id}
              biz={b}
              admin
              onReview={async (s) => {
                try {
                  await setBusinessStatus(b.id, s);
                  toast(s === 'approved' ? 'Business approved' : 'Business rejected');
                  reload();
                } catch (e) {
                  toast((e as Error).message);
                }
              }}
            />
          ))}

          <Section title="Society settings" />
          <MaintenanceSetting key={data!.amount} societyId={sid} amount={data!.amount} onSaved={reload} />

          <Section title="Manage" />
          <Card style={{ paddingVertical: 4 }}>
            <LinkRow icon="megaphone-outline" tint="purple" title="Post a notice" onPress={() => router.push('/community/notice-new')} />
            <LinkRow icon="people-outline" tint="green" title="Members & roles" subtitle="Make someone a guard or admin" onPress={() => router.push('/admin/members')} />
            <LinkRow icon="shield-checkmark-outline" tint="slate" title="Gate desk" onPress={() => router.push('/gate')} />
            <LinkRow icon="wallet-outline" tint="gold" title="Funds ledger" onPress={() => router.push('/funds')} last={profile?.role !== 'super_admin'} />
            {profile?.role === 'super_admin' ? (
              <>
                <LinkRow icon="business-outline" tint="blue" title="All societies & pilots" subtitle="Super Admin" onPress={() => router.push('/admin/societies')} />
                <LinkRow icon="chatbox-ellipses-outline" tint="purple" title="Feedback from residents" subtitle="Super Admin" onPress={() => router.push('/admin/feedback')} last />
              </>
            ) : null}
          </Card>
        </>
      )}
    </Screen>
  );
}
