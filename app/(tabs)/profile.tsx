import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card, Divider } from '@/components/Card';
import { HomeDetailsForm } from '@/components/HomeDetailsForm';
import { JoinRequests } from '@/components/JoinRequests';
import { LinkRow } from '@/components/LinkRow';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { Fine } from '@/components/Typography';
import { signOut } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, font } from '@/lib/theme';
import { isAdmin, roleLabel } from '@/lib/types';

export default function ProfileTab() {
  const { profile, error, refresh, session } = useAuth();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  async function reload() {
    setRefreshing(true);
    await refresh();
    setReloadKey((k) => k + 1);
    setRefreshing(false);
  }

  async function logout() {
    try {
      await signOut();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  if (error)
    return (
      <Screen title="Profile" onRefresh={reload} refreshing={refreshing}>
        <ErrorState message={error} onRetry={reload} />
      </Screen>
    );
  if (!profile) return <Loading />;

  const flat = [profile.tower, profile.flat].filter(Boolean).join('-');

  return (
    <Screen title="Profile" onRefresh={reload} refreshing={refreshing}>
      <Card style={s.me}>
        <Avatar name={profile.full_name || '?'} size={76} />
        <Text style={s.name}>{profile.full_name || 'Your name'}</Text>
        <Text style={s.email}>{session?.user.email}</Text>
        <View style={s.chips}>
          <Pill label={roleLabel[profile.role]} />
          {flat ? <Pill label={`Flat ${flat}`} tone="grey" /> : null}
          {profile.society ? <Pill label={profile.society.name} tone="grey" /> : null}
        </View>
      </Card>

      <Section title="Your details" action={editing ? undefined : { label: 'Edit', onPress: () => setEditing(true) }} />
      <Card>
        {editing ? (
          <>
            <HomeDetailsForm profile={profile} onSaved={() => { setEditing(false); refresh(); }} />
            <Button title="Cancel" variant="ghost" onPress={() => setEditing(false)} full style={{ marginTop: 4 }} />
          </>
        ) : (
          <>
            <Detail label="Phone" value={profile.phone} />
            <Divider />
            <Detail label="Tower / Wing" value={profile.tower} />
            <Divider />
            <Detail label="Flat" value={profile.flat} />
          </>
        )}
      </Card>

      {isAdmin(profile.role) ? (
        <>
          <Section title="Resident requests" />
          <JoinRequests me={profile} reloadKey={reloadKey} />
        </>
      ) : null}

      <Section title="Help & legal" />
      <Card style={s.list}>
        <LinkRow icon="book-outline" tint="blue" title="Community guidelines" onPress={() => router.push('/module/guidelines')} />
        <LinkRow icon="mail-outline" tint="rose" title="Report a problem" subtitle="Contact the Grievance Officer" onPress={() => router.push('/module/grievance')} />
        <LinkRow icon="lock-closed-outline" tint="slate" title="Privacy & data" onPress={() => router.push('/module/privacy')} last />
      </Card>

      <Button title="Sign out" variant="danger" onPress={logout} full />
      <Fine>Ghar Loop · version 1.0</Fine>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={s.detail}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={[s.detailValue, !value && { color: colors.faint }]}>{value || 'Not added'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  me: { alignItems: 'center', paddingVertical: 26 },
  name: { ...font('800'), fontSize: 22, color: colors.ink, marginTop: 14, letterSpacing: -0.4 },
  email: { ...font('400'), fontSize: 13, color: colors.muted, marginTop: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 14 },
  list: { paddingVertical: 4 },
  detail: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { ...font('400'), fontSize: 14, color: colors.muted },
  detailValue: { ...font('600'), fontSize: 15, color: colors.ink },
});
