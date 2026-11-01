import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChipSelect } from '@/components/ChipSelect';
import { DateTimeChips } from '@/components/DateTimeChips';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { ErrorText, Fine } from '@/components/Typography';
import { createActivity } from '@/lib/api';

export default function NewActivity() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [at, setAt] = useState(() => {
    const d = new Date(Date.now() + 2 * 86400000);
    d.setHours(7, 0, 0, 0);
    return d;
  });
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<string>('10');
  const [kind, setKind] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (title.trim().length < 3) return setError('Give it a name.');
    if (at.getTime() < Date.now()) return setError('Pick a time in the future.');
    const amount = kind === 'paid' ? parseInt(price, 10) : 0;
    if (kind === 'paid' && !(amount > 0)) return setError('Enter the price per person.');
    setBusy(true);
    setError(null);
    try {
      const res = await createActivity({
        title: title.trim(),
        description: description.trim(),
        starts_at: at.toISOString(),
        location: location.trim(),
        capacity: capacity === 'none' ? null : parseInt(capacity, 10),
        price: amount,
      });
      toast(res.status === 'live' ? 'Published! Neighbours can join now.' : 'Sent to your admin for approval.');
      router.replace(`/activities/${res.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen back title="Create activity" subtitle="Bring your neighbours together.">
      <Card style={{ padding: 18 }}>
        <Input label="Name" value={title} onChangeText={setTitle} placeholder="e.g. Sunday Morning Yoga" maxLength={80} />
        <Input label="About (optional)" value={description} onChangeText={setDescription} placeholder="Level, what to bring, age group…" multiline />
        <DateTimeChips value={at} onChange={setAt} label="When" />
        <Input label="Where" value={location} onChangeText={setLocation} placeholder="Clubhouse" />
        <ChipSelect
          label="How many people?"
          options={[
            { value: '4', label: '4' },
            { value: '10', label: '10' },
            { value: '20', label: '20' },
            { value: '50', label: '50' },
            { value: 'none', label: 'No limit' },
          ]}
          value={capacity}
          onChange={setCapacity}
        />
        <ChipSelect
          label="Free or paid?"
          options={[
            { value: 'free', label: 'Free', icon: 'gift-outline' },
            { value: 'paid', label: 'Paid', icon: 'cash-outline' },
          ]}
          value={kind}
          onChange={(v) => setKind(v as 'free' | 'paid')}
        />
        {kind === 'paid' ? (
          <>
            <Input label="Price per person (₹)" value={price} onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="499" />
            <Fine>Paid activities are checked by your admin before neighbours can join. Payments are in test mode.</Fine>
          </>
        ) : null}
        <ErrorText>{error}</ErrorText>
        <Button title={kind === 'paid' ? 'Send for approval' : 'Publish'} icon="rocket-outline" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
      </Card>
    </Screen>
  );
}
