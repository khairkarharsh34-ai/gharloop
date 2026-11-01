import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChipSelect } from '@/components/ChipSelect';
import { Input } from '@/components/Input';
import { PhotoPicker } from '@/components/PhotoPicker';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { ErrorText } from '@/components/Typography';
import { createIssue, uploadPhoto, type PickedPhoto } from '@/lib/api';
import { issueCategories } from '@/lib/categories';
import type { Priority } from '@/lib/types';

export default function NewIssue() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (title.trim().length < 3) return setError('Give the issue a short title.');
    if (!category) return setError('Pick a category.');
    setBusy(true);
    setError(null);
    try {
      const photo_url = photo ? await uploadPhoto(photo, 'issue') : null;
      const { id } = await createIssue({ title: title.trim(), description: description.trim(), category, priority, photo_url });
      toast('Issue reported. Your admin has been notified.');
      router.replace(`/resolve/${id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen back title="Report an issue" subtitle="Clear title + photo = faster fix.">
      <Card style={{ padding: 18 }}>
        <Input label="What's wrong?" value={title} onChangeText={setTitle} placeholder="e.g. Lift B2 stuck between floors" maxLength={120} />
        <Input
          label="Details (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Where exactly, since when, how many flats affected…"
          multiline
          style={{ minHeight: 90, textAlignVertical: 'top' }}
        />
        <ChipSelect label="Category" options={issueCategories} value={category} onChange={setCategory} />
        <ChipSelect
          label="How urgent?"
          options={[
            { value: 'low', label: 'Can wait' },
            { value: 'medium', label: 'Soon' },
            { value: 'high', label: 'Urgent' },
          ]}
          value={priority}
          onChange={(v) => setPriority(v as Priority)}
        />
        <PhotoPicker value={photo} onChange={setPhoto} label="Add a photo of the problem" />
        <ErrorText>{error}</ErrorText>
        <Button title="Report issue" icon="send" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
      </Card>
    </Screen>
  );
}
