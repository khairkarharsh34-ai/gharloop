import { useState } from 'react';
import { View } from 'react-native';
import { updateHelp } from '@/lib/api';
import { iconForHelp } from '@/lib/categories';
import { ago, flatOf } from '@/lib/format';
import { helpStatus } from '@/lib/status';
import type { HelpRequest } from '@/lib/types';
import { Button } from './Button';
import { Input } from './Input';
import { ItemCard } from './ItemCard';
import { Pill } from './Pill';
import { useToast } from './Toast';

const WHEN = { today: 'Today', tomorrow: 'Tomorrow', flexible: 'Flexible' };

/** A help request. Admins assign and close it; the requester can cancel. */
export function HelpCard({ req, admin, mine, onChanged }: { req: HelpRequest; admin: boolean; mine: boolean; onChanged: () => void }) {
  const toast = useToast();
  const [who, setWho] = useState(req.assigned_to ?? '');
  const st = helpStatus[req.status];
  const active = req.status === 'open' || req.status === 'assigned';

  async function update(patch: Parameters<typeof updateHelp>[1], msg: string) {
    try {
      await updateHelp(req.id, patch);
      toast(msg);
      onChanged();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  return (
    <ItemCard
      icon={iconForHelp(req.category)}
      tint="rose"
      title={`${req.category} · ${WHEN[req.preferred]}`}
      subtitle={req.details}
      meta={[
        admin ? [req.requester?.full_name, flatOf(req.requester)].filter(Boolean).join(' · ') : null,
        req.assigned_to ? `With ${req.assigned_to}` : null,
        ago(req.created_at),
      ]
        .filter(Boolean)
        .join(' · ')}
      right={<Pill label={st.label} tone={st.tone} />}
      footer={
        active && admin ? (
          <View>
            <Input value={who} onChangeText={setWho} placeholder="Assign to (e.g. Ramesh, plumber)" />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Button title="Assign" variant="secondary" small disabled={!who.trim()} onPress={() => update({ assigned_to: who.trim() }, 'Assigned')} style={{ flex: 1 }} />
              <Button title="Mark done" small onPress={() => update({ status: 'done' }, 'Marked done')} style={{ flex: 1 }} />
            </View>
          </View>
        ) : active && mine ? (
          <Button title="Cancel request" variant="ghost" small onPress={() => update({ status: 'cancelled' }, 'Request cancelled')} style={{ alignSelf: 'flex-end' }} />
        ) : null
      }
    />
  );
}
