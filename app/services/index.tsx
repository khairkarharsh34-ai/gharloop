import { router } from 'expo-router';
import { useState } from 'react';
import { BusinessCard } from '@/components/BusinessCard';
import { Button } from '@/components/Button';
import { ContactCard } from '@/components/ContactCard';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { Fine } from '@/components/Typography';
import { deleteContact, listBusinesses, listContacts, setBusinessStatus } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { isAdmin } from '@/lib/types';
import { useLoad } from '@/lib/useLoad';

export default function Services() {
  const { profile } = useAuth();
  const toast = useToast();
  const admin = isAdmin(profile?.role);
  const [tab, setTab] = useState<'contacts' | 'shops'>('contacts');
  const [q, setQ] = useState('');
  const { data, error, loading, refreshing, refresh, reload } = useLoad(async () => {
    const [contacts, shops] = await Promise.all([listContacts(), listBusinesses()]);
    return { contacts, shops };
  });

  const term = q.trim().toLowerCase();
  const match = (...f: (string | null | undefined)[]) => !term || f.some((x) => x?.toLowerCase().includes(term));
  const contacts = data?.contacts.filter((c) => match(c.name, c.service, c.note)) ?? [];
  const shops = data?.shops.filter((b) => match(b.name, b.category, b.description)) ?? [];

  async function run(fn: () => Promise<unknown>, msg: string) {
    try {
      await fn();
      toast(msg);
      reload();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  return (
    <Screen
      back
      title="Services & Shops"
      subtitle="Help your neighbours actually use."
      right={
        <Button
          small
          icon="add"
          title={tab === 'contacts' ? 'Contact' : 'Business'}
          onPress={() => router.push(tab === 'contacts' ? '/services/contact-new' : '/services/business-new')}
        />
      }
      onRefresh={refresh}
      refreshing={refreshing}
    >
      <Segmented
        options={[
          { key: 'contacts', label: 'Trusted contacts' },
          { key: 'shops', label: 'Home businesses' },
        ]}
        value={tab}
        onChange={setTab}
      />
      <Input value={q} onChangeText={setQ} placeholder="Search plumber, maid, cake, tiffin…" style={{ marginTop: -14, marginBottom: 12 }} />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : tab === 'contacts' ? (
        contacts.length ? (
          <>
            {contacts.map((c) => (
              <ContactCard key={c.id} contact={c} canDelete={c.added_by === profile?.id || admin} onDelete={() => run(() => deleteContact(c.id), 'Contact removed')} />
            ))}
            <Fine>Neighbour tips, not verified listings. Only add numbers with the person's consent.</Fine>
          </>
        ) : (
          <EmptyState
            icon="call-outline"
            tint="teal"
            title={term ? 'No match' : 'No contacts yet'}
            text="Share a plumber, maid or electrician you trust."
            action={{ title: 'Add a contact', onPress: () => router.push('/services/contact-new') }}
          />
        )
      ) : shops.length ? (
        <>
          {shops.map((b) => (
            <BusinessCard key={b.id} biz={b} admin={admin} onReview={(s) => run(() => setBusinessStatus(b.id, s), s === 'approved' ? 'Business approved' : 'Business rejected')} />
          ))}
          <Fine>Sellers are responsible for food safety, licensing and their orders. Ghar Loop connects neighbours.</Fine>
        </>
      ) : (
        <EmptyState
          icon="storefront-outline"
          tint="orange"
          title={term ? 'No match' : 'No home businesses yet'}
          text="Bake, cook, teach or sell from home? List it for your neighbours."
          action={{ title: 'List my business', onPress: () => router.push('/services/business-new') }}
        />
      )}
    </Screen>
  );
}
