import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { ErrorText } from '@/components/Typography';
import { createGroup } from '@/lib/api';

export default function NewGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (name.trim().length < 2) return setError('Give the group a name.');
    setBusy(true);
    setError(null);
    try {
      const { id } = await createGroup(name.trim(), description.trim());
      router.replace(`/community/chat/${id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen back title="New group" subtitle="Anyone in your society can join the conversation.">
      <Card style={{ padding: 18 }}>
        <Input label="Group name" value={name} onChangeText={setName} placeholder='e.g. "Block C Parents"' maxLength={60} />
        <Input label="What's it for? (optional)" value={description} onChangeText={setDescription} placeholder="School runs, birthday parties…" />
        <ErrorText>{error}</ErrorText>
        <Button title="Create group" icon="chatbubbles-outline" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
      </Card>
    </Screen>
  );
}
