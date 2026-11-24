import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChipSelect } from '@/components/ChipSelect';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { ErrorText, Fine } from '@/components/Typography';
import { sendFeedback, type FeedbackKind } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const KINDS: { value: FeedbackKind; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'problem', label: 'Something is wrong' },
  { value: 'praise', label: 'I like this' },
];

/** Residents, guards and committees tell the Ghar Loop team what to improve during the pilot. */
export default function SendFeedback() {
  const { profile } = useAuth();
  const toast = useToast();
  const [kind, setKind] = useState<FeedbackKind>('idea');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (message.trim().length < 3) return setError('Tell us a little more.');
    setBusy(true);
    setError(null);
    try {
      await sendFeedback(kind, message, profile?.society_id ?? null);
      toast('Thank you! The Ghar Loop team reads every message.');
      router.back();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen back title="Send feedback" subtitle="We're piloting Ghar Loop with your society. What should we fix or add?">
      <Card style={{ padding: 18 }}>
        <ChipSelect options={KINDS} value={kind} onChange={setKind} />
        <Input
          label="Your message"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={2000}
          placeholder={kind === 'problem' ? 'What happened, and on which screen?' : 'Tell us in your own words'}
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />
        <ErrorText>{error}</ErrorText>
        <Button title="Send to Ghar Loop" icon="send-outline" onPress={submit} loading={busy} full style={{ marginTop: 16 }} />
      </Card>
      <Fine>Goes to the Ghar Loop team only, not to your society. For a society problem (lift, water), use Resolve.</Fine>
    </Screen>
  );
}
