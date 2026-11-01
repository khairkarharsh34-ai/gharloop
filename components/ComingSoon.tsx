import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';
import { Screen } from './Screen';
import { EmptyState } from './States';
import { Hello, Muted } from './Typography';

type Props = { title: string; tagline: string; icon: string; showBack?: boolean };

/** Placeholder page for modules that are not built yet. Shows no fake data. */
export function ComingSoon({ title, tagline, icon, showBack }: Props) {
  return (
    <Screen>
      {showBack ? <BackLink /> : null}
      <Hello>{title}</Hello>
      <Muted>{tagline}</Muted>
      <View style={{ height: 16 }} />
      <EmptyState
        icon={icon}
        title="Coming in the next update"
        text="This module is being built. It will show your society's real data here."
      />
    </Screen>
  );
}

export function BackLink() {
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <Pressable onPress={back} hitSlop={10} style={s.back}>
      <Text style={s.text}>‹ Back</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  text: { color: colors.green, fontWeight: '800', fontSize: 14 },
});
