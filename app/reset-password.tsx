import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/Toast';
import { ErrorText, Muted } from '@/components/Typography';
import { updatePassword } from '@/lib/api';
import { useAuth } from '@/lib/auth';

/** Opened from the password-reset email (the link signs the user in), or from Profile → Change password. */
export default function ResetPassword() {
  const { session } = useAuth();
  const toast = useToast();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (pw.length < 8) return setError('Use at least 8 characters.');
    if (pw !== pw2) return setError("The two passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      await updatePassword(pw);
      toast('Password updated.');
      router.replace('/');
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen bleed>
      <Brand title={'Choose a new\npassword'} subtitle="Make it something only you would know." />
      <View style={{ paddingHorizontal: 18, marginTop: -40 }}>
        <Card style={{ padding: 20, paddingTop: 8 }}>
          {session ? (
            <>
              <Input label="New password" value={pw} onChangeText={setPw} secureTextEntry autoComplete="new-password" placeholder="At least 8 characters" />
              <Input label="Repeat new password" value={pw2} onChangeText={setPw2} secureTextEntry autoComplete="new-password" onSubmitEditing={submit} />
              <ErrorText>{error}</ErrorText>
              <Button title="Save new password" icon="lock-closed-outline" onPress={submit} loading={busy} full style={{ marginTop: 20 }} />
            </>
          ) : (
            <>
              <Muted style={{ marginTop: 14 }}>This reset link has expired or was already used. Request a new one.</Muted>
              <Button title="Request a new link" onPress={() => router.replace('/forgot-password')} full />
            </>
          )}
        </Card>
      </View>
    </Screen>
  );
}
