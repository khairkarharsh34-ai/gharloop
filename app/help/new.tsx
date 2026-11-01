import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChipSelect } from '@/components/ChipSelect';
import { IconChip } from '@/components/IconChip';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { ErrorText, Fine } from '@/components/Typography';
import { createHelp } from '@/lib/api';
import { helpCategories } from '@/lib/categories';
import type { HelpRequest } from '@/lib/types';

export default function NewHelp() {
  const { category = 'Other' } = useLocalSearchParams<{ category?: string }>();
  const cat = helpCategories.find((c) => c.value === category) ?? helpCategories[helpCategories.length - 1];
  const toast = useToast();
  const [details, setDetails] = useState('');
  const [preferred, setPreferred] = useState<HelpRequest['preferred']>('today');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (details.trim().length < 3) return setError('Describe what you need.');
    setBusy(true);
    setError(null);
    try {
      await createHelp({ category: cat.value, details: details.trim(), preferred });
      toast("Request sent. We'll keep you posted.");
      router.back();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen back title={`${cat.label} request`} subtitle="Tell us what you need.">
      <Card style={{ padding: 18 }}>
        <IconChip icon={cat.icon} tint={cat.tint} size={52} />
        <Input label="Describe the issue or requirement" value={details} onChangeText={setDetails} placeholder="e.g. Kitchen tap leaking since morning" multiline style={{ minHeight: 100, textAlignVertical: 'top' }} />
        <ChipSelect
          label="Preferred time"
          options={[
            { value: 'today', label: 'Today' },
            { value: 'tomorrow', label: 'Tomorrow' },
            { value: 'flexible', label: 'Flexible' },
          ]}
          value={preferred}
          onChange={(v) => setPreferred(v as HelpRequest['preferred'])}
        />
        <ErrorText>{error}</ErrorText>
        <Button title="Submit request" icon="send" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
        <Fine>Your request goes to your society's helpdesk and is tracked with an owner and status.</Fine>
      </Card>
    </Screen>
  );
}
