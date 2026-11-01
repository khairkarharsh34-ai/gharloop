import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChipSelect } from '@/components/ChipSelect';
import { DateTimeChips } from '@/components/DateTimeChips';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { ErrorText, Fine } from '@/components/Typography';
import { VisitorPass } from '@/components/VisitorPass';
import { createVisitor } from '@/lib/api';
import { visitorPurposes } from '@/lib/categories';
import type { Visitor } from '@/lib/types';

export default function NewVisitor() {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState<Visitor['purpose']>('guest');
  const [whenKind, setWhenKind] = useState<'now' | 'later'>('now');
  const [at, setAt] = useState(() => {
    const d = new Date(Date.now() + 3 * 3600000);
    d.setMinutes(0, 0, 0);
    return d;
  });
  const [created, setCreated] = useState<Visitor | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (name.trim().length < 2) return setError("Enter the visitor's name.");
    setBusy(true);
    setError(null);
    try {
      setCreated(await createVisitor({ name: name.trim(), purpose, expected_at: (whenKind === 'now' ? new Date() : at).toISOString() }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <Screen back title="Pass created ✓" subtitle="Share the code with your visitor. The guard verifies it at the gate.">
        <VisitorPass v={created} />
        <Button title="Done" onPress={() => router.back()} full />
        <Button title="Add another visitor" variant="ghost" onPress={() => { setCreated(null); setName(''); }} full />
      </Screen>
    );
  }

  return (
    <Screen back title="Pre-approve visitor" subtitle="No more phone tag with the guard.">
      <Card style={{ padding: 18 }}>
        <Input label="Visitor name" value={name} onChangeText={setName} placeholder="e.g. Anjali, Amazon delivery, Urban Company" />
        <ChipSelect label="Purpose" options={visitorPurposes} value={purpose} onChange={(v) => setPurpose(v as Visitor['purpose'])} />
        <ChipSelect
          label="When?"
          options={[
            { value: 'now', label: 'Arriving now' },
            { value: 'later', label: 'Later' },
          ]}
          value={whenKind}
          onChange={(v) => setWhenKind(v as 'now' | 'later')}
        />
        {whenKind === 'later' ? <DateTimeChips value={at} onChange={setAt} days={7} /> : null}
        <ErrorText>{error}</ErrorText>
        <Button title="Create gate pass" icon="key-outline" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
        <Fine>The guard sees the visitor's name, purpose and your flat. The code works until they leave.</Fine>
      </Card>
    </Screen>
  );
}
