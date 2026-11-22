import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Share, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconChip } from '@/components/IconChip';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { ErrorText, Fine, Muted } from '@/components/Typography';
import { deleteMyAccount, exportMyData } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { GRIEVANCE_EMAIL, NOTICE_DATE } from '@/lib/legal';
import { colors, font } from '@/lib/theme';

/** DPDP rights in one place: read the notice, download your data, delete your account. */
export default function MyData() {
  const { profile } = useAuth();
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const superAdmin = profile?.role === 'super_admin';

  async function download() {
    setDownloading(true);
    try {
      const json = JSON.stringify(await exportMyData(), null, 2);
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghar-loop-my-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({ message: json, title: 'My Ghar Loop data' });
      }
      toast('Your data is ready');
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  async function remove() {
    if (confirm?.trim().toUpperCase() !== 'DELETE') return setError('Type DELETE to confirm.');
    setDeleting(true);
    setError(null);
    try {
      await deleteMyAccount();
      // Signing out sends the app back to the login screen by itself.
    } catch (e) {
      setError((e as Error).message);
      setDeleting(false);
    }
  }

  return (
    <Screen back title="Your data & privacy" subtitle="Your rights under India's data protection law.">
      <Card style={s.card}>
        <View style={s.row}>
          <IconChip icon="shield-checkmark-outline" tint="green" />
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Privacy Notice</Text>
            <Muted>{profile?.consent ? `You accepted the version of ${NOTICE_DATE}.` : 'What we store, why, and who can see it.'}</Muted>
          </View>
        </View>
        <Button title="Read the Privacy Notice" variant="secondary" onPress={() => router.push('/module/privacy')} full style={{ marginTop: 14 }} />
      </Card>

      <Card style={s.card}>
        <View style={s.row}>
          <IconChip icon="download-outline" tint="blue" />
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Download my data</Text>
            <Muted>Your profile, posts, issues, visitors, messages and payments in one file.</Muted>
          </View>
        </View>
        <Button title="Download my data" icon="download-outline" variant="secondary" onPress={download} loading={downloading} full style={{ marginTop: 14 }} />
      </Card>

      <Card style={[s.card, { borderColor: '#f3c9c3' }]}>
        <View style={s.row}>
          <IconChip icon="trash-outline" tint="rose" />
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Delete my account</Text>
            <Muted>
              Erases your login, profile, photos, posts, visitor passes and requests. This can't be undone. Official notices
              and society accounts stay, without your name.
            </Muted>
          </View>
        </View>
        {superAdmin ? (
          <Muted style={{ marginTop: 12 }}>Super admin accounts are removed by Ghar Loop support: {GRIEVANCE_EMAIL}</Muted>
        ) : confirm === null ? (
          <Button title="Delete my account" variant="danger" icon="trash-outline" onPress={() => setConfirm('')} full style={{ marginTop: 14 }} />
        ) : (
          <>
            <Input label='Type "DELETE" to confirm' value={confirm} onChangeText={setConfirm} autoCapitalize="characters" placeholder="DELETE" />
            <ErrorText>{error}</ErrorText>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <Button title="Cancel" variant="secondary" onPress={() => { setConfirm(null); setError(null); }} style={{ flex: 1 }} />
              <Button title="Delete forever" icon="trash" onPress={remove} loading={deleting} style={{ flex: 2, backgroundColor: colors.red }} />
            </View>
          </>
        )}
      </Card>
      <Fine>Questions or a complaint? Grievance Officer: {GRIEVANCE_EMAIL}</Fine>
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { padding: 18 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  title: { ...font('800'), fontSize: 16, color: colors.ink },
});
