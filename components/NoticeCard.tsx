import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { deleteAnnouncement, setRsvp } from '@/lib/api';
import { ago, when } from '@/lib/format';
import { colors, font } from '@/lib/theme';
import type { Announcement } from '@/lib/types';
import { Button } from './Button';
import { Card, Row } from './Card';
import { DateBadge } from './DateBadge';
import { Icon } from './Icon';
import { IconChip } from './IconChip';
import { useToast } from './Toast';

type Props = { notice: Announcement; me: string; canManage: boolean; onChanged: () => void };

/** Announcement with optional event time, place and RSVP. */
export function NoticeCard({ notice, me, canManage, onChanged }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const going = notice.rsvps.some((r) => r.user_id === me);
  const isEvent = !!notice.event_at;

  async function toggle() {
    setBusy(true);
    try {
      await setRsvp(notice.id, !going);
      toast(going ? 'RSVP removed' : "You're going! 🎉");
      onChanged();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    try {
      await deleteAnnouncement(notice.id);
      toast('Notice deleted');
      onChanged();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  return (
    <Card>
      <Row style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        {isEvent ? <DateBadge value={notice.event_at!} /> : <IconChip icon="megaphone-outline" tint="purple" />}
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{notice.title}</Text>
          {isEvent ? (
            <View style={s.line}>
              <Icon name="time-outline" size={14} color={colors.muted} />
              <Text style={s.meta}>{when(notice.event_at!)}</Text>
              {notice.location ? (
                <>
                  <Icon name="location-outline" size={14} color={colors.muted} />
                  <Text style={s.meta}>{notice.location}</Text>
                </>
              ) : null}
            </View>
          ) : null}
        </View>
      </Row>
      {notice.body ? <Text style={s.body}>{notice.body}</Text> : null}
      <Text style={s.by}>
        {notice.author?.full_name ?? 'Admin'} · {ago(notice.created_at)}
        {isEvent ? ` · ${notice.rsvps.length} going` : ''}
      </Text>
      <View style={s.actions}>
        {isEvent ? (
          <Button
            title={going ? "You're going ✓" : "I'm attending"}
            variant={going ? 'secondary' : 'primary'}
            small
            onPress={toggle}
            loading={busy}
            style={{ flex: 1 }}
          />
        ) : null}
        {canManage ? <Button title="Delete" variant="ghost" small onPress={remove} /> : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  title: { ...font('700'), fontSize: 16, color: colors.ink },
  line: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  meta: { ...font('500'), fontSize: 12, color: colors.muted, marginRight: 8 },
  body: { ...font('400'), fontSize: 14, color: colors.ink2, lineHeight: 20, marginTop: 10 },
  by: { ...font('400'), fontSize: 12, color: colors.faint, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
});
