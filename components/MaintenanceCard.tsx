import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { payMaintenance } from '@/lib/api';
import { rupees } from '@/lib/format';
import { colors, font } from '@/lib/theme';
import { Button } from './Button';
import { Card, Row } from './Card';
import { IconChip } from './IconChip';
import { Pill } from './Pill';
import { useToast } from './Toast';
import { Fine } from './Typography';

type Props = { amount: number; paid: boolean; period: string; label: string; onPaid: () => void };

/** This month's maintenance with a fake "Pay (test)" button that records a payment row. */
export function MaintenanceCard({ amount, paid, period, label, onPaid }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    try {
      await payMaintenance(amount, period);
      toast('Payment recorded (test mode). Thank you!');
      onPaid();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card style={{ padding: 18 }}>
      <Row>
        <IconChip icon="home-outline" tint={paid ? 'green' : 'gold'} />
        <Pill label={paid ? 'Paid ✓' : 'Due'} tone={paid ? 'green' : 'gold'} />
      </Row>
      <Text style={s.label}>Your maintenance · {label}</Text>
      <Text style={s.amount}>{rupees(amount)}</Text>
      {paid ? null : <Button title={`Pay ${rupees(amount)} (test)`} icon="card-outline" onPress={pay} loading={busy} full />}
      <Fine>Test mode: no money moves. A payment record is saved and shows in the society ledger.</Fine>
    </Card>
  );
}

const s = StyleSheet.create({
  label: { ...font('500'), fontSize: 13, color: colors.muted, marginTop: 12 },
  amount: { ...font('800'), fontSize: 30, color: colors.ink, letterSpacing: -0.6 },
});
