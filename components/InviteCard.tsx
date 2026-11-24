import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getInviteCode } from '@/lib/api';
import { inviteLink, inviteMessage, shareText } from '@/lib/share';
import { colors, font } from '@/lib/theme';
import { Button } from './Button';
import { Card } from './Card';
import { IconChip } from './IconChip';
import { useToast } from './Toast';
import { Fine } from './Typography';

/** The society's invite code and link, with one tap to share it on WhatsApp. */
export function InviteCard({ societyId, societyName }: { societyId: string; societyName: string }) {
  const toast = useToast();
  const [code, setCode] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getInviteCode(societyId).then(setCode).catch(() => setCode(null));
  }, [societyId]);

  if (code === undefined) return null;
  if (!code) return null; // 006_pilot.sql not run yet, or no permission

  async function share() {
    const how = await shareText(inviteMessage(societyName, code!));
    if (how === 'copied') toast('Invite message copied. Paste it in your society WhatsApp group.');
  }

  return (
    <Card style={s.card}>
      <View style={s.row}>
        <IconChip icon="person-add-outline" tint="green" />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Invite residents</Text>
          <Text style={s.sub}>Share this link in your society's WhatsApp group.</Text>
        </View>
      </View>
      <View style={s.codeBox}>
        <Text style={s.codeLabel}>SOCIETY CODE</Text>
        <Text style={s.code}>{code.split('').join(' ')}</Text>
        <Text style={s.link} selectable>{inviteLink(code)}</Text>
      </View>
      <Button title="Share invite" icon="share-social-outline" onPress={share} full />
      <Fine>You still approve every resident before they can see the society.</Fine>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 18 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  title: { ...font('800'), fontSize: 16, color: colors.ink },
  sub: { ...font('400'), fontSize: 13, color: colors.muted, marginTop: 2 },
  codeBox: { backgroundColor: colors.soft, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginVertical: 14 },
  codeLabel: { ...font('700'), fontSize: 11, letterSpacing: 1.5, color: colors.green },
  code: { ...font('800'), fontSize: 28, letterSpacing: 2, color: colors.greenDark, marginTop: 4 },
  link: { ...font('500'), fontSize: 12.5, color: colors.green, marginTop: 4 },
});
