import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { ErrorText, Muted } from '@/components/Typography';
import { sendPasswordReset } from '@/lib/api';
import { LOGIN_MODES, type LoginMode } from '@/lib/phone';
import { colors, font } from '@/lib/theme';

export default function ForgotPassword() {
  const [mode, setMode] = useState<LoginMode>('mobile');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!email.includes('@')) return setError('Enter the email you signed up with.');
    setBusy(true);
    setError(null);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen bleed>
      <Brand title={'Forgot your\npassword?'} subtitle="No problem. We'll help you set a new one." />
      <View style={s.body}>
        <Card style={{ padding: 20, paddingTop: 8 }}>
          <View style={{ marginTop: 14, marginBottom: -2 }}>
            <Segmented options={LOGIN_MODES} value={mode} onChange={(m) => { setMode(m); setError(null); }} />
          </View>
          {mode === 'mobile' ? (
            <>
              <Text style={s.title}>Ask your Society Admin</Text>
              <Muted>
                Mobile accounts don't get reset emails. Ask your Society Admin to open Admin → Members, tap your name and
                choose "Set temporary password". Sign in with it, then go to Profile → Change password.
              </Muted>
            </>
          ) : sent ? (
            <>
              <Text style={s.title}>Check your inbox 📬</Text>
              <Muted>
                If {email.trim()} has a Ghar Loop account, a reset link is on its way. Open it on this device. Check spam if
                you don't see it in a minute.
              </Muted>
            </>
          ) : (
            <>
              <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" onSubmitEditing={submit} />
              <ErrorText>{error}</ErrorText>
              <Button title="Send reset link" icon="mail-outline" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
            </>
          )}
        </Card>
        <Link href="/sign-in" style={s.link}>
          Back to <Text style={s.linkBold}>Sign in</Text>
        </Link>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: 18, marginTop: -40 },
  title: { ...font('800'), fontSize: 18, color: colors.ink, marginTop: 4, marginBottom: 6 },
  link: { ...font('400'), textAlign: 'center', color: colors.muted, fontSize: 14, marginTop: 10 },
  linkBold: { ...font('800'), color: colors.green },
});
