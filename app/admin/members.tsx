import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { ChipSelect } from '@/components/ChipSelect';
import { ItemCard } from '@/components/ItemCard';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { Fine } from '@/components/Typography';
import { listMembers, setMemberRole, setMemberStatus } from '@/lib/api';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/auth';
import { flatOf } from '@/lib/format';
import { roleLabel, type Role } from '@/lib/types';
import { useLoad } from '@/lib/useLoad';

const ROLES: { value: Role; label: string }[] = [
  { value: 'resident', label: 'Resident' },
  { value: 'guard', label: 'Guard' },
  { value: 'society_admin', label: 'Admin' },
];

export default function Members() {
  const { profile } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const { data, error, loading, refreshing, refresh, reload } = useLoad(() => listMembers(profile!.society_id!), [profile?.society_id]);

  async function run(fn: () => Promise<void>, msg: string) {
    try {
      await fn();
      toast(msg);
      setOpen(null);
      reload();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  return (
    <Screen back title="Members & roles" subtitle={`${data?.length ?? '…'} verified members`} onRefresh={refresh} refreshing={refreshing}>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : !data!.length ? (
        <EmptyState icon="people-outline" title="No members yet" />
      ) : (
        data!.map((m) => {
          const me = m.id === profile?.id;
          const locked = me || m.role === 'super_admin';
          return (
            <ItemCard
              key={m.id}
              left={<Avatar name={m.full_name} size={42} />}
              title={m.full_name || 'Unnamed'}
              subtitle={flatOf(m) || undefined}
              right={<Pill label={me ? 'You' : roleLabel[m.role]} tone={m.role === 'resident' ? 'grey' : m.role === 'guard' ? 'blue' : 'green'} />}
              onPress={locked ? undefined : () => setOpen(open === m.id ? null : m.id)}
              footer={
                open === m.id ? (
                  <>
                    <ChipSelect options={ROLES} value={m.role} onChange={(r) => run(() => setMemberRole(m.id, r), `${m.full_name} is now ${roleLabel[r]}`)} />
                    <Button title="Remove from society" variant="ghost" small onPress={() => run(() => setMemberStatus(m.id, 'rejected'), 'Member removed')} full />
                  </>
                ) : null
              }
            />
          );
        })
      )}
      <Fine>Tap a member to change their role. Guards get the gate desk; admins can approve, assign and post notices.</Fine>
    </Screen>
  );
}
