import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConsentChecks, type Consent } from '@/components/ConsentChecks';
import { Screen } from '@/components/Screen';
import { ErrorText, Muted } from '@/components/Typography';
import { acceptPrivacyNotice, signOut } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { MIN_AGE, NOTICE_DATE } from '@/lib/legal';

/** Asks signed-in people to accept the privacy notice (new or updated) before using the app. */
export default function ConsentScreen() {
  const { refresh } = useAuth();
  const [consent, setConsent] = useState<Consent>({ adult: false, privacy: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    if (!consent.adult) return setError(`Ghar Loop accounts are only for people aged ${MIN_AGE} or older.`);
    if (!consent.privacy) return setError('Please read and accept the Privacy Notice to continue.');
    setBusy(true);
    setError(null);
    try {
      await acceptPrivacyNotice();
      await refresh();
      router.replace('/');
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen bleed>
      <Brand title={'Your privacy,\nin your hands'} subtitle={`We updated our Privacy Notice on ${NOTICE_DATE}. Please read it and confirm to continue.`} />
      <View style={{ paddingHorizontal: 18, marginTop: -40 }}>
        <Card style={{ padding: 20, paddingTop: 8 }}>
          <Muted style={{ marginTop: 14 }}>
            It explains what we store, who can see it, how long we keep it, and how to download or delete your data at any time.
          </Muted>
          <ConsentChecks value={consent} onChange={setConsent} />
          <ErrorText>{error}</ErrorText>
          <Button title="Agree and continue" icon="checkmark" onPress={accept} loading={busy} full style={{ marginTop: 20 }} />
          <Button title="Sign out" variant="ghost" onPress={() => signOut().catch(() => undefined)} full style={{ marginTop: 4 }} />
        </Card>
      </View>
    </Screen>
  );
}
