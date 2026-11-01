import { StyleSheet, Text } from 'react-native';
import { colors, radius, font } from '@/lib/theme';

export type PillTone = 'green' | 'gold' | 'red' | 'blue' | 'grey';

const tones: Record<PillTone, { bg: string; fg: string }> = {
  green: { bg: colors.soft, fg: colors.green },
  gold: { bg: colors.goldBg, fg: colors.gold },
  red: { bg: colors.redBg, fg: colors.red },
  blue: { bg: colors.blueBg, fg: colors.blue },
  grey: { bg: '#efede7', fg: colors.ink2 },
};

export function Pill({ label, tone = 'green' }: { label: string; tone?: PillTone }) {
  const t = tones[tone];
  return <Text style={[s.pill, { backgroundColor: t.bg, color: t.fg }]}>{label}</Text>;
}

const s = StyleSheet.create({
  pill: { ...font('700'),
    fontSize: 11,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
});
