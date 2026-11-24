import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconChip } from '@/components/IconChip';
import { Screen } from '@/components/Screen';
import { ErrorState, Loading } from '@/components/States';
import { Fine, Muted } from '@/components/Typography';
import { societyByCode } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, font } from '@/lib/theme';
import type { Society } from '@/lib/types';

/** Opened from a society's invite link: app.gharloop.com/join/ABC234 */
export default function Join() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { session } = useAuth();
  const [society, setSociety] = useState<Society | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setSociety(undefined);
    societyByCode(code ?? '').then(setSociety).catch((e) => setError((e as Error).message));
  };
  useEffect(load, [code]);

  return (
    <Screen bleed>
      <Brand title={'You\'re invited\nto Ghar Loop'} subtitle="Notices, complaints, visitors and SOS for your society, in one app." />
      <View style={{ paddingHorizontal: 18, marginTop: -40 }}>
        <Card style={{ padding: 20 }}>
          {error ? (
            <ErrorState message={error} onRetry={load} />
          ) : society === undefined ? (
            <Loading label="Finding your society…" />
          ) : society === null ? (
            <>
              <Text style={s.title}>This invite code doesn't work</Text>
              <Muted>Check the link with your society committee, or pick your society when you create an account.</Muted>
              <Button title="Create an account" onPress={() => router.replace('/sign-up')} full style={{ marginTop: 18 }} />
            </>
          ) : (
            <>
              <View style={s.row}>
                <IconChip icon="business-outline" tint="green" size={52} />
                <View style={{ flex: 1 }}>
                  <Text style={s.overline}>JOIN YOUR SOCIETY</Text>
                  <Text style={s.title}>{society.name}</Text>
                  <Text style={s.city}>{society.city}</Text>
                </View>
              </View>
              {session ? (
                <>
                  <Muted style={{ marginTop: 14 }}>You're already signed in. Your committee approves you once your society is chosen in your profile.</Muted>
                  <Button title="Open Ghar Loop" onPress={() => router.replace('/')} full style={{ marginTop: 18 }} />
                </>
              ) : (
                <>
                  <Button title="Create my account" icon="person-add-outline" onPress={() => router.replace({ pathname: '/sign-up', params: { code } })} full style={{ marginTop: 18 }} />
                  <Button title="I already have an account" variant="ghost" onPress={() => router.replace('/sign-in')} full style={{ marginTop: 4 }} />
                </>
              )}
            </>
          )}
        </Card>
        <Fine>Your committee confirms every resident, so only your neighbours see your society.</Fine>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  overline: { ...font('800'), fontSize: 11, letterSpacing: 1, color: colors.green },
  title: { ...font('800'), fontSize: 20, color: colors.ink, marginTop: 2 },
  city: { ...font('400'), fontSize: 14, color: colors.muted, marginTop: 2 },
});
