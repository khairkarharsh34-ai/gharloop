import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { raiseSos } from '@/lib/api';
import { colors, font } from '@/lib/theme';
import { Button } from './Button';
import { Card } from './Card';
import { Icon } from './Icon';
import { useToast } from './Toast';
import { Fine } from './Typography';

/** Two-step SOS so it isn't pressed by accident. Alerts guards + admins instantly. */
export function SosButton({ onSent }: { onSent: () => void }) {
  const toast = useToast();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    try {
      await raiseSos('Emergency at my flat');
      toast('SOS sent. Security and your admin have been alerted.');
      setArmed(false);
      onSent();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card style={s.card}>
      <View style={s.row}>
        <View style={s.icon}>
          <Icon name="alert-circle" size={26} color={colors.red} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Emergency SOS</Text>
          <Text style={s.sub}>Instantly alerts the guard on duty and your Society Admin with your flat number.</Text>
        </View>
      </View>
      {armed ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <Button title="Cancel" variant="secondary" onPress={() => setArmed(false)} style={{ flex: 1 }} />
          <Button title="Send SOS now" icon="alert-circle" onPress={send} loading={busy} style={{ flex: 2, backgroundColor: colors.red }} />
        </View>
      ) : (
        <Button title="SOS — Alert security" variant="danger" icon="alert-circle-outline" onPress={() => setArmed(true)} full />
      )}
      {armed ? <Fine>Tap "Send SOS now" to confirm.</Fine> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { borderColor: '#f3c9c3', padding: 18 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.redBg, alignItems: 'center', justifyContent: 'center' },
  title: { ...font('800'), fontSize: 17, color: colors.ink },
  sub: { ...font('400'), fontSize: 13, color: colors.muted, marginTop: 2, lineHeight: 18 },
});
