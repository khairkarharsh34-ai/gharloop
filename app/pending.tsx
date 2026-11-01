import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { HomeDetailsForm } from '@/components/HomeDetailsForm';
import { Screen } from '@/components/Screen';
import { ErrorState, Loading } from '@/components/States';
import { StepHeader } from '@/components/StepHeader';
import { Steps } from '@/components/Steps';
import { useToast } from '@/components/Toast';
import { Fine, Muted } from '@/components/Typography';
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
      <Screen title="Hmm…" onRefresh={reload} refreshing={refreshing}>
        <ErrorState message={error} onRetry={reload} />
        <Button title="Sign out" variant="ghost" onPress={logout} full />
      </Screen>
    );
  }
  if (!profile) return <Loading label="Setting up your profile…" />;

  const first = profile.full_name.split(' ')[0] || 'neighbour';
  const waiting = profile.status === 'pending' && profile.society_id;
  const rejected = profile.status === 'rejected';
  const flat = [profile.tower, profile.flat].filter(Boolean).join('-');

  return (
    <Screen
      title={waiting ? `Almost there, ${first}` : `Hi ${first} 👋`}
      subtitle={waiting ? 'Your society needs to confirm you live there.' : 'Tell us where you live to get started.'}
      onRefresh={reload}
      refreshing={refreshing}
    >
      {waiting ? (
        <Card style={{ padding: 20 }}>
          <Steps
            steps={[
              { title: 'Account created', state: 'done' },
              { title: 'Request sent', detail: [profile.society?.name, flat].filter(Boolean).join(' · '), state: 'done' },
              { title: 'Society Admin approval', detail: 'Usually within a day. Pull down to check.', state: 'current' },
              { title: 'Welcome to your community', state: 'todo' },
            ]}
          />
          <Button title="Check again" onPress={reload} loading={refreshing} full style={{ marginTop: 0 }} />
        </Card>
      ) : (
        <Card style={{ padding: 20 }}>
          <StepHeader
            n={1}
            title={rejected ? 'Request not approved' : 'Choose your society'}
            hint={rejected ? 'Check your details and send again' : 'Your admin will approve you'}
          />
          {rejected ? <Muted style={{ marginTop: 10 }}>Your Society Admin could not verify these details.</Muted> : null}
          <HomeDetailsForm profile={profile} chooseSociety saveLabel="Send join request" onSaved={refresh} />
        </Card>
      )}

      <Button title="Sign out" variant="ghost" onPress={logout} full />
      <Fine>Only verified residents can see neighbours, notices and society data.</Fine>
    </Screen>
  );
}
