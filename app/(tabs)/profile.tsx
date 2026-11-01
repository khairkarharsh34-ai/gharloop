import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from '@/components/Button';
import { Card, Row } from '@/components/Card';
import { HomeDetailsForm } from '@/components/HomeDetailsForm';
import { JoinRequests } from '@/components/JoinRequests';
import { LinkRow } from '@/components/LinkRow';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { Bold, Hello, Muted } from '@/components/Typography';
import { signOut } from '@/lib/api';
import { useAuth } from '@/lib/auth';
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

  if (error) return <Screen onRefresh={reload} refreshing={refreshing}><ErrorState message={error} onRetry={reload} /></Screen>;
  if (!profile) return <Loading />;

  const home = [profile.tower && `Tower ${profile.tower}`, profile.flat && `Flat ${profile.flat}`].filter(Boolean).join(' · ');

  return (
    <Screen onRefresh={reload} refreshing={refreshing}>
      <Hello>Profile</Hello>
      <Muted>{[profile.society?.name, home].filter(Boolean).join(' · ') || 'Padosi'}</Muted>

      <Card style={s.me}>
        <Text style={s.avatar}>👤</Text>
        <Bold>{profile.full_name || 'Your name'}</Bold>
        <Muted>{roleLabel[profile.role]} · {session?.user.email}</Muted>
      </Card>

      <Section title="Your details" />
      <Card>
        {editing ? (
          <HomeDetailsForm profile={profile} onSaved={() => { setEditing(false); refresh(); }} />
        ) : (
          <>
            <Muted>Phone: {profile.phone || 'Not added'}</Muted>
            <Muted>Home: {home || 'Not added'}</Muted>
            <Button title="Edit details" variant="secondary" onPress={() => setEditing(true)} full />
          </>
        )}
      </Card>

      <Section title="Administration" />
      <Card>
        <Row>
          <Bold>Role</Bold>
          <Pill label={roleLabel[profile.role]} />
        </Row>
        <Muted>Authorized admin accounts see their relevant dashboard.</Muted>
      </Card>

      {isAdmin(profile.role) ? (
        <>
          <Section title="Resident requests" />
          <JoinRequests me={profile} reloadKey={reloadKey} />
        </>
      ) : null}

      <Section title="Legal & support" />
      <LinkRow title="Community guidelines" onPress={() => router.push('/module/guidelines')} />
      <LinkRow title="Report a problem / contact Grievance Officer" onPress={() => router.push('/module/grievance')} />
      <LinkRow title="Privacy policy & data" onPress={() => router.push('/module/privacy')} />

      <Button title="Sign out" variant="danger" onPress={logout} full />
    </Screen>
  );
}

const s = StyleSheet.create({
  me: { alignItems: 'center', marginTop: 14 },
  avatar: { fontSize: 42 },
});
