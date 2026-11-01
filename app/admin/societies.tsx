import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { ItemCard } from '@/components/ItemCard';
import { Pill } from '@/components/Pill';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { ErrorText } from '@/components/Typography';
import { countSocietyMembers, createSociety, listAllSocieties } from '@/lib/api';
import { useLoad } from '@/lib/useLoad';

/** Super Admin: every society on the platform, and onboarding a new one. */
export default function Societies() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data, error: loadErr, loading, refreshing, refresh, reload } = useLoad(async () => {
    const list = await listAllSocieties();
    const counts = await Promise.all(list.map((s) => countSocietyMembers(s.id)));
    return list.map((s, i) => ({ ...s, members: counts[i] }));
  });

  async function add() {
    if (name.trim().length < 3 || city.trim().length < 2) return setError('Enter the society name and city.');
    setBusy(true);
    setError(null);
    try {
      await createSociety(name.trim(), city.trim());
      toast(`${name.trim()} created. Residents can now pick it at sign-up.`);
      setName('');
      setCity('');
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen back title="Societies" subtitle="Platform-wide control (Super Admin)" onRefresh={refresh} refreshing={refreshing}>
      <Card style={{ padding: 18 }}>
        <Input label="New society name" value={name} onChangeText={setName} placeholder="Palm Residency" />
        <Input label="City" value={city} onChangeText={setCity} placeholder="Mumbai" />
        <ErrorText>{error}</ErrorText>
        <Button title="Create society" icon="add" onPress={add} loading={busy} full />
      </Card>
      <Section title={`All societies (${data?.length ?? 0})`} />
      {loadErr ? (
        <ErrorState message={loadErr} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : !data!.length ? (
        <EmptyState icon="business-outline" title="No societies yet" />
      ) : (
        data!.map((s) => (
          <ItemCard key={s.id} icon="business-outline" tint="blue" title={s.name} subtitle={s.city} meta={`Maintenance ₹${s.maintenance_amount}/month`} right={<Pill label={`${s.members} members`} />} />
        ))
      )}
    </Screen>
  );
}
