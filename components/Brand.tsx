import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '@/lib/theme';
import { Hero } from './Hero';
import { Logo } from './Logo';

/** Green welcome panel at the top of the login and sign-up screens. */
export function Brand({ title, subtitle }: { title: string; subtitle: string }) {
  const insets = useSafeAreaInsets();
  return (
    <Hero style={[s.hero, { paddingTop: insets.top + 34 }]}>
      <Logo />
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
    </Hero>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 64, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  title: { ...font('800'), color: colors.white, fontSize: 30, marginTop: 36, letterSpacing: -0.8, lineHeight: 36 },
  subtitle: { ...font('400'), color: 'rgba(255,255,255,0.78)', fontSize: 15, marginTop: 8, lineHeight: 22 },
});
