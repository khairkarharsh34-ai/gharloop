import { StyleSheet, Text, View } from 'react-native';
import { colors, type Tint, font } from '@/lib/theme';
import { Card } from './Card';
import { Icon, type IconName } from './Icon';
import { IconChip } from './IconChip';
import { Pill } from './Pill';
import { Screen } from './Screen';

type Props = { title: string; tagline: string; icon: IconName; tint?: Tint; points?: string[]; showBack?: boolean };

/** Placeholder page for modules that are not built yet. Shows no fake data. */
export function ComingSoon({ title, tagline, icon, tint = 'green', points = [], showBack }: Props) {
  return (
    <Screen title={title} subtitle={tagline} back={showBack}>
      <Card style={s.card}>
        <IconChip icon={icon} tint={tint} size={64} />
        <View style={{ marginTop: 16 }}>
          <Pill label="Coming soon" tone="gold" />
        </View>
        <Text style={s.title}>We're building this next</Text>
        <Text style={s.text}>It will show your society's real data here.</Text>
        {points.length ? (
          <View style={s.list}>
            {points.map((p) => (
              <View key={p} style={s.pointRow}>
                <Icon name="checkmark-circle" size={20} color={colors.green} />
                <Text style={s.point}>{p}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: 30 },
  title: { ...font('800'), fontSize: 18, color: colors.ink, marginTop: 12 },
  text: { ...font('400'), fontSize: 14, color: colors.muted, marginTop: 6, textAlign: 'center' },
  list: { alignSelf: 'stretch', marginTop: 20, gap: 10, backgroundColor: colors.bg, borderRadius: 14, padding: 16 },
  pointRow: { flexDirection: 'row', gap: 10 },
  point: { ...font('400'), flex: 1, fontSize: 14, color: colors.ink2, lineHeight: 20 },
});
