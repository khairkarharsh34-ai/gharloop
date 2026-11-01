import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { updateIssue, uploadPhoto, type PickedPhoto } from '@/lib/api';
import { isoDate, shortDate } from '@/lib/format';
import type { Issue } from '@/lib/types';
import { Button } from './Button';
import { Card } from './Card';
import { ChipSelect } from './ChipSelect';
import { Input } from './Input';
import { PhotoPicker } from './PhotoPicker';
import { StepHeader } from './StepHeader';
import { useToast } from './Toast';
import { ErrorText } from './Typography';

const plus = (days: number) => isoDate(new Date(Date.now() + days * 86400000));
const DUE = [
  { value: plus(1), label: 'Tomorrow' },
  { value: plus(3), label: 'In 3 days' },
  { value: plus(7), label: 'In a week' },
  { value: plus(14), label: 'In 2 weeks' },
];

/** Admin-only: assign owner + deadline, start work, close with proof photo. */
export function IssueAdminPanel({ issue, onChanged }: { issue: Issue; onChanged: () => void }) {
  const toast = useToast();
  const [owner, setOwner] = useState(issue.owner_name ?? '');
  const [due, setDue] = useState<string | null>(issue.due_date);
  const [proof, setProof] = useState<PickedPhoto | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(key: string, fn: () => Promise<void>, done: string) {
    setBusy(key);
    setError(null);
    try {
      await fn();
      toast(done);
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const assign = () => {
    if (!owner.trim()) return setError('Who owns this? e.g. Maintenance Committee');
    if (!due) return setError('Pick a deadline.');
    act('assign', () => updateIssue(issue.id, { owner_name: owner.trim(), due_date: due }), 'Owner and deadline saved');
  };
  const resolve = () => {
    if (!proof) return setError('Add a photo of the fix first.');
    act(
      'resolve',
      async () => updateIssue(issue.id, { status: 'resolved', proof_url: await uploadPhoto(proof, 'proof') }),
      'Marked resolved with proof',
    );
  };

  if (issue.status === 'resolved') {
    return (
      <Card style={{ padding: 18 }}>
        <StepHeader n={1} title="Admin" hint="This issue is closed" />
        <Button title="Reopen issue" variant="secondary" icon="refresh" onPress={() => act('reopen', () => updateIssue(issue.id, { status: 'open' }), 'Reopened')} loading={busy === 'reopen'} full />
      </Card>
    );
  }

  return (
    <Card style={{ padding: 18 }}>
      <StepHeader n={1} title="Owner & deadline" hint="Every issue needs both" />
      <Input value={owner} onChangeText={setOwner} placeholder="e.g. Maintenance Committee, Plumber Ramesh" />
      <ChipSelect options={DUE.some((d) => d.value === due) || !due ? DUE : [...DUE, { value: due, label: `Due ${shortDate(due)}` }]} value={due} onChange={setDue} />
      <Button title={issue.owner_name ? 'Update owner & deadline' : 'Assign owner'} icon="person-add-outline" onPress={assign} loading={busy === 'assign'} full />

      <View style={s.gap} />
      <StepHeader n={2} title="Work started?" />
      <Button
        title={issue.status === 'in_progress' ? 'Work in progress ✓' : 'Mark in progress'}
        variant="secondary"
        icon="hammer-outline"
        disabled={issue.status === 'in_progress'}
        onPress={() => act('start', () => updateIssue(issue.id, { status: 'in_progress' }), 'Marked in progress')}
        loading={busy === 'start'}
        full
      />

      <View style={s.gap} />
      <StepHeader n={3} title="Close with proof" hint="A photo of the fix is required" />
      <PhotoPicker value={proof} onChange={setProof} label="Add photo of the fix" />
      <Button title="Mark resolved" icon="checkmark-circle-outline" onPress={resolve} loading={busy === 'resolve'} full />
      <ErrorText>{error}</ErrorText>
    </Card>
  );
}

const s = StyleSheet.create({ gap: { height: 22 } });
