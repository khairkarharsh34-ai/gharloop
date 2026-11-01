import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { EmptyState } from '@/components/States';
import { Grid, Tile } from '@/components/Tile';
import { Hello, Muted } from '@/components/Typography';
import { useAuth } from '@/lib/auth';

const modules: { icon: string; title: string; subtitle: string; href: Href }[] = [
  { icon: '🏢', title: 'Resolve', subtitle: 'Issues, owners & deadlines', href: '/resolve' },
  { icon: '🤝', title: 'Community', subtitle: 'Neighbours, chats & announcements', href: '/community' },
  { icon: '🎯', title: 'Activities', subtitle: 'Free, paid & nearby', href: '/activities' },
  { icon: '🛠️', title: 'Services & Shops', subtitle: 'Recommended local help', href: '/module/services' },
  { icon: '🆘', title: 'Need Help', subtitle: 'Request trusted help', href: '/module/needhelp' },
  { icon: '💰', title: 'Funds', subtitle: 'Maintenance transparency', href: '/module/funds' },
  { icon: '🚪', title: 'Gate & Visitors', subtitle: 'Pre-approve & SOS', href: '/module/gate' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const { profile, refresh } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  async function reload() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const firstName = profile?.full_name.split(' ')[0] || 'neighbour';
  const place = profile?.society ? `${profile.society.name} · ${profile.society.city}` : 'Padosi platform';

  return (
    <Screen onRefresh={reload} refreshing={refreshing}>
      <Hello>
        {greeting()}, {firstName} 👋
      </Hello>
      <Muted>{place}</Muted>

      <Section title="Your community" />
      <Grid>
        {modules.map((m) => (
          <Tile key={m.title} icon={m.icon} title={m.title} subtitle={m.subtitle} onPress={() => router.push(m.href)} />
        ))}
      </Grid>

      <Section title="This week" />
      {/* Filled with real issues, activities and businesses as each module is built. */}
      <EmptyState icon="📅" title="Nothing this week yet" text="Open issues, upcoming activities and new resident businesses will show up here." />
    </Screen>
  );
}
