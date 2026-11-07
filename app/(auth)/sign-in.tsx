import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { Fine } from '@/components/Typography';
import { signIn } from '@/lib/api';
import { LOGIN_MODES, type LoginMode } from '@/lib/phone';
import { colors, font } from '@/lib/theme';

export default function SignIn() {
  const [mode, setMode] = useState<LoginMode>('mobile');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const login = mode === 'mobile' ? mobile.trim() : email.trim();
    if (!login || !password) return setError(mode === 'mobile' ? 'Enter your mobile number and password.' : 'Enter your email and password.');
    if (mode === 'email' && !login.includes('@')) return setError('Enter a valid email address.');
    setBusy(true);
    setError(null);
    try {
      await signIn(login, password);
      // The app switches screens by itself once the login is saved.
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen bleed>
      <Brand title={'Welcome\nhome.'} subtitle="Your society's notices, issues, visitors and neighbours — in one place." />
      <View style={s.body}>
        <Card style={s.card}>
          <View style={{ marginTop: 14, marginBottom: -2 }}>
            <Segmented options={LOGIN_MODES} value={mode} onChange={(m) => { setMode(m); setError(null); }} />
          </View>
          {mode === 'mobile' ? (
            <Input label="Mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" autoComplete="tel" placeholder="98765 43210" maxLength={16} />
          ) : (
            <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
          )}
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Your password" onSubmitEditing={submit} />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <Link href="/forgot-password" style={s.forgot}>
            Forgot password?
          </Link>
          <Button title="Sign in" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
        </Card>
        <Link href="/sign-up" style={s.link}>
          New to Ghar Loop? <Text style={s.linkBold}>Create an account</Text>
        </Link>
        <Fine>Only verified residents of your society can see its information.</Fine>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: 18, marginTop: -40 },
  card: { padding: 20, paddingTop: 8 },
  error: { ...font('400'), color: colors.red, fontSize: 13, marginTop: 12 },
  link: { ...font('400'), textAlign: 'center', color: colors.muted, fontSize: 14, marginTop: 10 },
  linkBold: { ...font('800'), color: colors.green },
  forgot: { ...font('600'), color: colors.green, fontSize: 13, marginTop: 12, alignSelf: 'flex-end' },
});
