import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Hero } from '@/components/Hero';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { QuickAction } from '@/components/QuickAction';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { HomeFeed } from '@/components/HomeFeed';
import { ItemCard } from '@/components/ItemCard';
import { Grid, Tile } from '@/components/Tile';
import { Fine } from '@/components/Typography';
import { useAuth } from '@/lib/auth';
import { gate, modules } from '@/lib/modules';
import { isAdmin } from '@/lib/types';
import { colors, font } from '@/lib/theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const { profile, refresh } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [feedKey, setFeedKey] = useState(0);
  const guard = profile?.role === 'guard';

  async function reload() {
    setRefreshing(true);
    setFeedKey((k) => k + 1);
    await refresh();
    setRefreshing(false);
  }

  const name = profile?.full_name || 'Neighbour';
  const flat = [profile?.tower, profile?.flat].filter(Boolean).join('-');
  const place = profile?.society ? [profile.society.name, flat].filter(Boolean).join(' · ') : 'Ghar Loop platform';

  return (
    <Screen bleed onRefresh={reload} refreshing={refreshing}>
      <Hero style={[s.hero, { paddingTop: insets.top + 14 }]}>
        <View style={s.top}>
          <Logo size={34} />
          <Pressable onPress={() => router.push('/profile')} style={s.avatarRing}>
            <Avatar name={name} size={38} />
          </Pressable>
        </View>

        <Text style={s.greet}>{greeting()},</Text>
        <Text style={s.name}>{name.split(' ')[0]} 👋</Text>
        <View style={s.place}>
          <Icon name="location-outline" size={15} color={colors.white} />
          <Text style={s.placeText}>{place}</Text>
        </View>

        {guard ? (
          <View style={s.actions}>
            <QuickAction icon="keypad-outline" label="Verify code" onPress={() => router.push(gate.href)} />
            <QuickAction icon="people-outline" label="Expected" onPress={() => router.push(gate.href)} />
            <QuickAction icon="construct-outline" label="Report" onPress={() => router.push('/resolve/new')} />
            <QuickAction icon="chatbubbles-outline" label="Notices" onPress={() => router.push('/community')} />
          </View>
        ) : (
          <View style={s.actions}>
            <QuickAction icon="person-add-outline" label="Visitor" onPress={() => router.push('/gate/new')} />
            <QuickAction icon="construct-outline" label="Report" onPress={() => router.push('/resolve/new')} />
            <QuickAction icon="hand-left-outline" label="Get help" onPress={() => router.push('/help')} />
            <QuickAction icon="alert-circle-outline" label="SOS" danger onPress={() => router.push(gate.href)} />
          </View>
        )}
      </Hero>

      <View style={s.body}>
        {isAdmin(profile?.role) ? (
          <View style={{ marginTop: 18, marginBottom: -8 }}>
            <ItemCard
              icon="speedometer-outline"
              tint="gold"
              title="Admin dashboard"
              subtitle="Approvals, members, roles and stats"
              onPress={() => router.push('/admin')}
            />
          </View>
        ) : null}
        <Section title="Explore your society" />
        <Grid>
          {[...modules, gate].map((m) => (
            <Tile key={m.key} icon={m.icon} tint={m.tint} title={m.title} subtitle={m.subtitle} onPress={() => router.push(m.href)} />
          ))}
        </Grid>

        <Section title="This week" />
        <HomeFeed reloadKey={feedKey} />
        <Fine>Ghar Loop · made for neighbours</Fine>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarRing: { padding: 2, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.25)' },
  greet: { ...font('400'), color: 'rgba(255,255,255,0.75)', fontSize: 16, marginTop: 28 },
  name: { ...font('800'), color: colors.white, fontSize: 32, letterSpacing: -0.8, marginTop: 2 },
  place: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  placeText: { ...font('600'), color: colors.white, fontSize: 13, },
  actions: { flexDirection: 'row', marginTop: 26, gap: 6 },
  body: { paddingHorizontal: 18 },
});
