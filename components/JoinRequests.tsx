import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { listJoinRequests, setMemberStatus } from '@/lib/api';
import type { JoinRequest, Profile } from '@/lib/types';
import { Button } from './Button';
import { Card } from './Card';
import { EmptyState, ErrorState, Loading } from './States';
import { useToast } from './Toast';
import { Bold, Muted } from './Typography';

/** Pending residents an admin can accept or reject. `reloadKey` changes on pull-to-refresh. */
export function JoinRequests({ me, reloadKey }: { me: Profile; reloadKey: number }) {
  const toast = useToast();
  const [items, setItems] = useState<JoinRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Super admins see every society; society admins only their own.
  const societyId = me.role === 'super_admin' ? null : me.society_id;

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await listJoinRequests(societyId));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [societyId]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  async function decide(id: string, accept: boolean) {
    setBusyId(id);
    try {
      await setMemberStatus(id, accept ? 'approved' : 'rejected');
      setItems((list) => list?.filter((r) => r.id !== id) ?? null);
      toast(accept ? 'Resident approved' : 'Request rejected');
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items) return <Loading label="Loading requests…" />;
  if (!items.length) return <EmptyState icon="✅" title="No pending requests" text="New residents waiting for approval show up here." />;

  return (
    <View>
      {items.map((r) => (
        <Card key={r.id}>
          <Bold>
            {r.full_name || 'Unnamed'} · {[r.tower, r.flat].filter(Boolean).join('-') || 'No flat'}
          </Bold>
          <Muted>
            {[me.role === 'super_admin' ? r.society?.name : null, r.phone, `Requested ${new Date(r.created_at).toLocaleDateString('en-IN')}`]
              .filter(Boolean)
              .join(' · ')}
          </Muted>
          <View style={s.actions}>
            <Button title="Accept" onPress={() => decide(r.id, true)} loading={busyId === r.id} disabled={!!busyId} />
            <Button title="Reject" variant="danger" onPress={() => decide(r.id, false)} disabled={!!busyId} />
          </View>
        </Card>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 6, marginTop: 9 },
});
