import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card, Row } from '@/components/Card';
import { HomeDetailsForm } from '@/components/HomeDetailsForm';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { Bold, Fine, Hello, Muted } from '@/components/Typography';
import { signOut } from '@/lib/api';
import { useAuth } from '@/lib/auth';

/** Shown after sign-up until the Society Admin approves the resident. */
export default function Pending() {
  const { profile, error, refresh } = useAuth();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  async function reload() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  async function logout() {
    try {
      await signOut();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  if (error) {
    return (
      <Screen onRefresh={reload} refreshing={refreshing}>
        <ErrorState message={error} onRetry={reload} />
        <Button title="Sign out" variant="danger" onPress={logout} full />
      </Screen>
    );
  }
  if (!profile) return <Loading label="Setting up your profile…" />;

  const waiting = profile.status === 'pending' && profile.society_id;
  const rejected = profile.status === 'rejected';

  return (
    <Screen onRefresh={reload} refreshing={refreshing}>
      <Hello>Welcome, {profile.full_name.split(' ')[0] || 'neighbour'} 👋</Hello>
      <Muted>{profile.society ? `${profile.society.name} · ${profile.society.city}` : 'Choose your society to continue'}</Muted>

      {waiting ? (
        <Card style={{ marginTop: 16 }}>
          <Row>
            <Bold>⏳ Waiting for approval</Bold>
            <Pill label="Pending" tone="gold" />
          </Row>
          <Muted>
            Your Society Admin will check your details ({[profile.tower, profile.flat].filter(Boolean).join('-') || 'flat not set'})
            and approve you. Pull down or tap below to check again.
          </Muted>
          <Button title="Check again" onPress={reload} loading={refreshing} full />
        </Card>
      ) : (
        <Card style={{ marginTop: 16 }}>
          <Row>
            <Bold>{rejected ? 'Request not approved' : 'Choose your society'}</Bold>
            {rejected ? <Pill label="Rejected" tone="red" /> : null}
          </Row>
          <Muted>
            {rejected
              ? 'Your Society Admin could not verify these details. Correct them and send the request again.'
              : 'Pick your society and add your flat so the admin can approve you.'}
          </Muted>
          <HomeDetailsForm profile={profile} chooseSociety saveLabel="Send join request" onSaved={refresh} />
        </Card>
      )}

      <Button title="Sign out" variant="danger" onPress={logout} full />
      <Fine>Only verified residents can see neighbours, announcements and society data.</Fine>
    </Screen>
  );
}
