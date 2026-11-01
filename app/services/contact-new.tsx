import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChipSelect } from '@/components/ChipSelect';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { ErrorText, Fine } from '@/components/Typography';
import { addContact } from '@/lib/api';
import { serviceTypes } from '@/lib/categories';

export default function NewContact() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [service, setService] = useState<string | null>(null);
  const [phone, setPhone] = useState('+91 ');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (name.trim().length < 2) return setError('Enter their name.');
    if (!service) return setError('What do they do?');
    if (phone.replace(/\D/g, '').length < 10) return setError('Enter a valid phone number.');
    setBusy(true);
    setError(null);
    try {
      await addContact({ name: name.trim(), service, phone: phone.trim(), note: note.trim() });
      toast('Shared with your society');
      router.back();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen back title="Share a contact" subtitle="Someone you trust and would recommend.">
      <Card style={{ padding: 18 }}>
        <Input label="Name" value={name} onChangeText={setName} placeholder="Ramesh Patil" />
        <ChipSelect label="Service" options={serviceTypes} value={service} onChange={setService} />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Your tip (optional)" value={note} onChangeText={setNote} placeholder="Timings, rates, why you trust them…" multiline />
        <Fine>Only add a number with that person's consent.</Fine>
        <ErrorText>{error}</ErrorText>
        <Button title="Share contact" icon="share-social-outline" onPress={submit} loading={busy} full style={{ marginTop: 16 }} />
      </Card>
    </Screen>
  );
}
