import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { listJoinRequests, setMemberStatus } from '@/lib/api';
import { colors, font } from '@/lib/theme';
import type { JoinRequest, Profile } from '@/lib/types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Card } from './Card';
import { Pill } from './Pill';
import { EmptyState, ErrorState, Loading } from './States';
import { useToast } from './Toast';

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
  if (!items.length)
    return <EmptyState icon="checkmark-done-outline" title="All caught up" text="New residents waiting for approval will show up here." />;

  return (
    <View>
      {items.map((r) => {
        const flat = [r.tower, r.flat].filter(Boolean).join('-');
        const meta = [me.role === 'super_admin' ? r.society?.name : null, `Asked ${new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`];
        return (
          <Card key={r.id}>
            <View style={s.top}>
              <Avatar name={r.full_name || '?'} />
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{r.full_name || 'Unnamed'}</Text>
                <Text style={s.meta}>{meta.filter(Boolean).join(' · ')}</Text>
              </View>
              {flat ? <Pill label={flat} tone="blue" /> : null}
            </View>
            <View style={s.actions}>
              <Button title="Reject" variant="danger" small onPress={() => decide(r.id, false)} disabled={!!busyId} style={s.flex} />
              <Button title="Approve" small onPress={() => decide(r.id, true)} loading={busyId === r.id} disabled={!!busyId} style={s.flex} />
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { ...font('700'), fontSize: 16, color: colors.ink },
  meta: { ...font('400'), fontSize: 12, color: colors.muted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  flex: { flex: 1 },
});
