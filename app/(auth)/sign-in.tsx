import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { Bold } from '@/components/Typography';
import { signIn } from '@/lib/api';
import { colors } from '@/lib/theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      // The app switches screens by itself once the login is saved.
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen bare>
      <Brand />
      <Card>
        <Bold>Sign in</Bold>
        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="••••••" onSubmitEditing={submit} />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <Button title="Sign in" onPress={submit} loading={busy} full />
      </Card>
      <Link href="/sign-up" style={s.link}>
        New to Padosi? <Text style={s.linkBold}>Create an account</Text>
      </Link>
    </Screen>
  );
}

const s = StyleSheet.create({
  error: { color: colors.red, fontSize: 12, marginTop: 10 },
  link: { textAlign: 'center', color: colors.muted, fontSize: 13, marginTop: 14 },
  linkBold: { color: colors.green, fontWeight: '800' },
});
