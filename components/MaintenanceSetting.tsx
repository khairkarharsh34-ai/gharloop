import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { setMaintenanceAmount } from '@/lib/api';
import { colors, font } from '@/lib/theme';
import { Button } from './Button';
import { Card } from './Card';
import { IconChip } from './IconChip';
import { Input } from './Input';
import { useToast } from './Toast';
import { ErrorText } from './Typography';

/** Lets the committee set the monthly maintenance per flat shown in Funds. */
export function MaintenanceSetting({ societyId, amount, onSaved }: { societyId: string; amount: number; onSaved: () => void }) {
  const toast = useToast();
  const [value, setValue] = useState(String(amount));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changed = Number(value) !== amount;

  async function save() {
    const n = Number(value.replace(/[^0-9]/g, ''));
    if (!value.trim() || Number.isNaN(n)) return setError('Enter the amount in rupees.');
    setBusy(true);
    setError(null);
    try {
      await setMaintenanceAmount(societyId, n);
      toast('Maintenance amount saved');
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card style={{ padding: 18 }}>
      <View style={s.row}>
        <IconChip icon="wallet-outline" tint="gold" />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Monthly maintenance</Text>
          <Text style={s.sub}>Per flat, shown to residents in Funds.</Text>
        </View>
      </View>
      <Input label="Amount (₹ per flat per month)" value={value} onChangeText={setValue} keyboardType="number-pad" placeholder="3000" />
      <ErrorText>{error}</ErrorText>
      {changed ? <Button title="Save amount" onPress={save} loading={busy} full style={{ marginTop: 12 }} /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  title: { ...font('800'), fontSize: 16, color: colors.ink },
  sub: { ...font('400'), fontSize: 13, color: colors.muted, marginTop: 2 },
});
