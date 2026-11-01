import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { SocietyPicker } from '@/components/SocietyPicker';
import { useToast } from '@/components/Toast';
import { StepHeader } from '@/components/StepHeader';
import { Fine } from '@/components/Typography';
import { signUp } from '@/lib/api';
import { colors } from '@/lib/theme';

export default function SignUp() {
  const toast = useToast();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', tower: '', flat: '' });
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    if (!form.full_name.trim()) return setError('Enter your name.');
    if (!form.email.trim()) return setError('Enter your email.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (!societyId) return setError('Choose your society.');
    if (!form.flat.trim()) return setError('Enter your flat number.');
    setBusy(true);
    setError(null);
    try {
      const { needsConfirm } = await signUp({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        tower: form.tower.trim(),
        flat: form.flat.trim(),
        society_id: societyId,
      });
      if (needsConfirm) {
        toast('Check your email and tap the link, then sign in.');
        router.replace('/sign-in');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen bleed>
      <Brand title={'Join your\nsociety on Padosi'} subtitle="Takes a minute. Your Society Admin approves new residents." />
      <View style={s.body}>
        <Card style={s.card}>
          <StepHeader n={1} title="About you" />
          <Input label="Full name" value={form.full_name} onChangeText={set('full_name')} placeholder="Akash Sharma" autoComplete="name" />
          <Input label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
          <Input label="Password" value={form.password} onChangeText={set('password')} secureTextEntry placeholder="At least 6 characters" autoComplete="new-password" />
          <Input label="Phone (optional)" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="+91" />
        </Card>
        <Card style={s.card}>
          <StepHeader n={2} title="Your home" hint="Pick your society and flat" />
          <SocietyPicker value={societyId} onChange={setSocietyId} />
          <View style={s.two}>
            <View style={s.half}>
              <Input label="Tower / Wing" value={form.tower} onChangeText={set('tower')} placeholder="B" autoCapitalize="characters" />
            </View>
            <View style={s.half}>
              <Input label="Flat" value={form.flat} onChangeText={set('flat')} placeholder="1204" />
            </View>
          </View>
          {error ? <Text style={s.error}>{error}</Text> : null}
          <Button title="Create account" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
        </Card>
        <Link href="/sign-in" style={s.link}>
          Already have an account? <Text style={s.linkBold}>Sign in</Text>
        </Link>
        <Fine>By joining you agree to follow your society's community guidelines.</Fine>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: 18, marginTop: -40 },
  card: { padding: 20 },
  two: { flexDirection: 'row', gap: 9 },
  half: { flex: 1 },
  error: { color: colors.red, fontSize: 13, marginTop: 12 },
  link: { textAlign: 'center', color: colors.muted, fontSize: 14, marginTop: 10 },
  linkBold: { color: colors.green, fontWeight: '800' },
});
