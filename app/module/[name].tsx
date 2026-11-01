import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { IconChip } from '@/components/IconChip';
import { Screen } from '@/components/Screen';
import { Fine } from '@/components/Typography';
import { colors, font } from '@/lib/theme';
import type { IconName } from '@/components/Icon';
import type { Tint } from '@/lib/theme';

type Page = { icon: IconName; tint: Tint; title: string; tagline: string; points: string[]; note?: string };

// Help & legal pages. Plain-language summaries; the full legal text should be reviewed by a lawyer before launch.
const pages: Record<string, Page> = {
  guidelines: {
    icon: 'book-outline',
    tint: 'blue',
    title: 'Community guidelines',
    tagline: 'How we keep Ghar Loop friendly and useful.',
    points: [
      'Be respectful. No abuse, threats, or discrimination by religion, caste, gender, language or food habits.',
      'Keep it useful: report issues in Resolve, not as complaints in chats.',
      'Share contacts only with that person\'s consent.',
      'No spam or outside advertising. Home businesses must be approved by your admin.',
      'Food sellers must have a valid FSSAI registration.',
      'Admins can remove posts or members who break these rules.',
    ],
  },
  privacy: {
    icon: 'lock-closed-outline',
    tint: 'slate',
    title: 'Privacy & data',
    tagline: 'What we store and why.',
    points: [
      'Your name and flat are visible only to verified residents of your society.',
      'Your phone number is private. Neighbours cannot see it.',
      'Visitor passes are visible only to you, guards and your admin.',
      'SOS alerts go only to guards and admins of your society.',
      'Photos you upload to issues are visible to your society.',
      'Payments in this version are test records. No card or bank details are collected.',
    ],
    note: 'Ghar Loop follows the Digital Personal Data Protection Act, 2023. To delete your account and data, raise it with your Society Admin.',
  },
  grievance: {
    icon: 'mail-outline',
    tint: 'rose',
    title: 'Report a problem',
    tagline: 'Content, safety or privacy concerns.',
    points: [
      'For society problems (lift, water, security), use Resolve: it gets an owner and a deadline.',
      'For abusive content or a privacy concern, tell your Society Admin first.',
      'Complaints are acknowledged within 24 hours and resolved within 15 days, as per the IT Rules, 2021.',
    ],
    note: 'Grievance Officer contact details will be published here before public launch.',
  },
};

export default function InfoPage() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const page = pages[name];
  if (!page) {
    return (
      <Screen back title="Not found" subtitle="This page does not exist.">
        <Button title="Go home" onPress={() => router.replace('/')} full />
      </Screen>
    );
  }
  return (
    <Screen back title={page.title} subtitle={page.tagline}>
      <Card style={{ padding: 18 }}>
        <IconChip icon={page.icon} tint={page.tint} size={52} />
        <View style={{ marginTop: 16, gap: 12 }}>
          {page.points.map((p) => (
            <View key={p} style={s.row}>
              <Icon name="checkmark-circle" size={20} color={colors.green} />
              <Text style={s.text}>{p}</Text>
            </View>
          ))}
        </View>
      </Card>
      {name === 'grievance' ? <Button title="Report an issue in Resolve" icon="construct-outline" onPress={() => router.push('/resolve/new')} full /> : null}
      {page.note ? <Fine>{page.note}</Fine> : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  text: { ...font('400'), flex: 1, fontSize: 14, color: colors.ink2, lineHeight: 20 },
});
