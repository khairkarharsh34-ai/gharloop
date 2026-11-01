import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChipSelect } from '@/components/ChipSelect';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { ErrorText } from '@/components/Typography';
import { addFundEntry } from '@/lib/api';
import { isoDate } from '@/lib/format';

const CATS = {
  income: ['Maintenance', 'Clubhouse booking', 'Penalty', 'Interest', 'Other income'],
  expense: ['Security', 'Housekeeping', 'Lift AMC', 'Electricity', 'Water', 'Repairs', 'Gardening', 'Other expense'],
};

export default function NewFundEntry() {
  const toast = useToast();
  const [kind, setKind] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const n = parseInt(amount, 10);
    if (!category) return setError('Pick a category.');
    if (!(n > 0)) return setError('Enter the amount.');
    setBusy(true);
    setError(null);
    try {
      await addFundEntry({ kind, category, amount: n, note: note.trim() || null, entry_date: isoDate(new Date()) });
      toast('Added to the ledger');
      router.back();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen back title="Ledger entry" subtitle="Every rupee, visible to every resident.">
      <Card style={{ padding: 18 }}>
        <ChipSelect
          label="Type"
          options={[
            { value: 'expense', label: 'Expense', icon: 'arrow-up-circle-outline' },
            { value: 'income', label: 'Income', icon: 'arrow-down-circle-outline' },
          ]}
          value={kind}
          onChange={(v) => {
            setKind(v as 'income' | 'expense');
            setCategory(null);
          }}
        />
        <ChipSelect label="Category" options={CATS[kind].map((c) => ({ value: c, label: c }))} value={category} onChange={setCategory} />
        <Input label="Amount (₹)" value={amount} onChangeText={(t) => setAmount(t.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="120000" />
        <Input label="Invoice / reference (recommended)" value={note} onChangeText={setNote} placeholder="e.g. Guard agency invoice #SG-1182" />
        <ErrorText>{error}</ErrorText>
        <Button title="Add to ledger" icon="checkmark" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
      </Card>
    </Screen>
  );
}
