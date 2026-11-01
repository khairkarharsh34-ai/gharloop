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
import { EmptyState } from '@/components/States';
import { Grid, Tile } from '@/components/Tile';
import { Fine } from '@/components/Typography';
import { useAuth } from '@/lib/auth';
import { gate, modules } from '@/lib/modules';
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

  async function reload() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const name = profile?.full_name || 'Neighbour';
  const flat = [profile?.tower, profile?.flat].filter(Boolean).join('-');
  const place = profile?.society ? [profile.society.name, flat].filter(Boolean).join(' · ') : 'Padosi platform';

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

        <View style={s.actions}>
          <QuickAction icon="person-add-outline" label="Visitor" onPress={() => router.push(gate.href)} />
          <QuickAction icon="construct-outline" label="Report" onPress={() => router.push('/resolve')} />
          <QuickAction icon="hand-left-outline" label="Get help" onPress={() => router.push('/module/needhelp')} />
          <QuickAction icon="alert-circle-outline" label="SOS" danger onPress={() => router.push(gate.href)} />
        </View>
      </Hero>

      <View style={s.body}>
        <Section title="Explore your society" />
        <Grid>
          {modules.map((m) => (
            <Tile key={m.key} icon={m.icon} tint={m.tint} title={m.title} subtitle={m.subtitle} onPress={() => router.push(m.href)} />
          ))}
        </Grid>

        <Section title="This week" />
        {/* Filled with real issues, activities and businesses as each module is built. */}
        <EmptyState
          icon="calendar-outline"
          tint="orange"
          title="A quiet week so far"
          text="Open issues, upcoming activities and new home businesses from your society will appear here."
        />
        <Fine>Padosi · made for neighbours</Fine>
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
