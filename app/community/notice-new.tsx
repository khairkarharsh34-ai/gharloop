import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChipSelect } from '@/components/ChipSelect';
import { DateTimeChips } from '@/components/DateTimeChips';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { ErrorText } from '@/components/Typography';
import { createAnnouncement } from '@/lib/api';

export default function NewNotice() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isEvent, setIsEvent] = useState<'no' | 'yes'>('no');
  const [at, setAt] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    d.setHours(11, 0, 0, 0);
    return d;
  });
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (title.trim().length < 3) return setError('Add a title.');
    setBusy(true);
    setError(null);
    try {
      const event = isEvent === 'yes';
      await createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        event_at: event ? at.toISOString() : null,
        location: event ? location.trim() || null : null,
      });
      toast('Notice posted to everyone');
      router.back();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen back title="New notice" subtitle="Visible to every verified resident.">
      <Card style={{ padding: 18 }}>
        <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Water tank cleaning" maxLength={120} />
        <Input label="Message" value={body} onChangeText={setBody} placeholder="What do residents need to know?" multiline style={{ minHeight: 100, textAlignVertical: 'top' }} />
        <ChipSelect
          label="Is this an event people can attend?"
          options={[
            { value: 'no', label: 'Just a notice', icon: 'megaphone-outline' },
            { value: 'yes', label: 'Event with RSVP', icon: 'calendar-outline' },
          ]}
          value={isEvent}
          onChange={setIsEvent}
        />
        {isEvent === 'yes' ? (
          <>
            <DateTimeChips value={at} onChange={setAt} label="When" />
            <Input label="Where" value={location} onChangeText={setLocation} placeholder="Clubhouse" />
          </>
        ) : null}
        <ErrorText>{error}</ErrorText>
        <Button title="Post notice" icon="megaphone-outline" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
      </Card>
    </Screen>
  );
}
