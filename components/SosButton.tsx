import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { raiseSos } from '@/lib/api';
import { SOS_KINDS, type SosKind } from '@/lib/emergency';
import { colors, font } from '@/lib/theme';
import { Button } from './Button';
import { Card } from './Card';
import { callNumber, EmergencyCalls } from './EmergencyCalls';
import { Icon } from './Icon';
import { useToast } from './Toast';
import { Fine } from './Typography';

/**
 * Two-step SOS so it isn't pressed by accident: choose what's wrong, then confirm.
 * Alerts guards + admins instantly, then offers to call Ambulance / Police / Fire.
 */
export function SosButton({ onSent }: { onSent: () => void }) {
  const toast = useToast();
  const [armed, setArmed] = useState(false);
  const [kind, setKind] = useState<SosKind>('medical');
  const [sent, setSent] = useState<SosKind | null>(null);
  const [busy, setBusy] = useState(false);
  const chosen = SOS_KINDS.find((k) => k.key === kind)!;
  const sentKind = SOS_KINDS.find((k) => k.key === sent);

  async function send() {
    setBusy(true);
    try {
      await raiseSos(chosen.note);
      toast('SOS sent. Security and your admin have been alerted.');
      setArmed(false);
      setSent(kind);
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

      {sentKind?.call ? (
        <View style={s.sent}>
          <Text style={s.sentText}>Security has been alerted. Need {sentKind.call.label.toLowerCase()} too?</Text>
          <Button title={`Call ${sentKind.call.label} · ${sentKind.call.number}`} icon="call" onPress={() => callNumber(sentKind.call!.number)} full style={{ backgroundColor: colors.red }} />
        </View>
      ) : null}

      {armed ? (
        <>
          <Text style={s.ask}>What's the emergency?</Text>
          <View style={s.kinds}>
            {SOS_KINDS.map((k) => {
              const on = k.key === kind;
              return (
                <Pressable key={k.key} onPress={() => setKind(k.key)} style={[s.kind, on && s.kindOn]}>
                  <Icon name={k.icon} size={22} color={on ? colors.white : colors.red} />
                  <Text style={[s.kindText, on && { color: colors.white }]}>{k.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Button title="Cancel" variant="secondary" onPress={() => setArmed(false)} style={{ flex: 1 }} />
            <Button title="Send SOS now" icon="alert-circle" onPress={send} loading={busy} style={{ flex: 2, backgroundColor: colors.red }} />
          </View>
          <Fine>Sends "{chosen.note}" to security and your admin.</Fine>
        </>
      ) : (
        <Button title="SOS — Alert security" variant="danger" icon="alert-circle-outline" onPress={() => { setArmed(true); setSent(null); }} full style={{ marginTop: 14 }} />
      )}

      <Text style={s.ask}>Call emergency services</Text>
      <EmergencyCalls />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { borderColor: '#f3c9c3', padding: 18 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.redBg, alignItems: 'center', justifyContent: 'center' },
  title: { ...font('800'), fontSize: 17, color: colors.ink },
  sub: { ...font('400'), fontSize: 13, color: colors.muted, marginTop: 2, lineHeight: 18 },
  ask: { ...font('700'), fontSize: 14, color: colors.ink, marginTop: 18 },
  kinds: { flexDirection: 'row', gap: 8, marginTop: 10 },
  kind: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: '#f3c9c3', backgroundColor: colors.white },
  kindOn: { backgroundColor: colors.red, borderColor: colors.red },
  kindText: { ...font('700'), fontSize: 12.5, color: colors.ink, marginTop: 4 },
  sent: { marginTop: 14, padding: 14, borderRadius: 14, backgroundColor: colors.redBg },
  sentText: { ...font('600'), fontSize: 13.5, color: colors.ink, marginBottom: 10 },
});
