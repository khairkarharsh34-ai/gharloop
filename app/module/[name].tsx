import { router, useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';
import { GRIEVANCE_EMAIL, grievanceSteps, NOTICE_DATE, privacyNotice, type Section } from '@/lib/legal';
import { useAuth } from '@/lib/auth';
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

type Page = { icon: IconName; tint: Tint; title: string; tagline: string; points: string[]; sections?: Section[]; note?: string };

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
    title: 'Privacy Notice',
    tagline: `What we store, why, and your rights. Updated ${NOTICE_DATE}.`,
    points: [],
    sections: privacyNotice,
    note: `Ghar Loop follows the Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025. Questions: ${GRIEVANCE_EMAIL}`,
  },
  grievance: {
    icon: 'mail-outline',
    tint: 'rose',
    title: 'Report a problem',
    tagline: 'Content, safety or privacy concerns.',
    points: grievanceSteps,
    note: 'Grievance Officer, Ghar Loop · ' + GRIEVANCE_EMAIL,
  },
};

export default function InfoPage() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const page = pages[name];
  const { session } = useAuth();
  if (!page) {
    return (
      <Screen back title="Not found" subtitle="This page does not exist.">
        <Button title="Go home" onPress={() => router.replace('/')} full />
      </Screen>
    );
  }
  return (
    <Screen back title={page.title} subtitle={page.tagline}>
      {page.points.length ? (
        <Card style={{ padding: 18 }}>
          <IconChip icon={page.icon} tint={page.tint} size={52} />
          <Points points={page.points} />
        </Card>
      ) : null}
      {page.sections?.map((sec) => (
        <Card key={sec.title} style={{ padding: 18 }}>
          <Text style={s.h}>{sec.title}</Text>
          <Points points={sec.points} />
        </Card>
      ))}
      {name === 'grievance' ? (
        <View style={{ gap: 8 }}>
          <Button title={`Email ${GRIEVANCE_EMAIL}`} icon="mail-outline" onPress={() => Linking.openURL(`mailto:${GRIEVANCE_EMAIL}?subject=Ghar%20Loop%20grievance`)} full />
          {session ? <Button title="Report a society issue in Resolve" variant="secondary" icon="construct-outline" onPress={() => router.push('/resolve/new')} full /> : null}
        </View>
      ) : null}
      {page.note ? <Fine>{page.note}</Fine> : null}
    </Screen>
  );
}

function Points({ points }: { points: string[] }) {
  return (
    <View style={{ marginTop: 12, gap: 12 }}>
      {points.map((p) => (
        <View key={p} style={s.row}>
          <Icon name="checkmark-circle" size={20} color={colors.green} />
          <Text style={s.text}>{p}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  h: { ...font('800'), fontSize: 17, color: colors.ink },
  row: { flexDirection: 'row', gap: 10 },
  text: { ...font('400'), flex: 1, fontSize: 14, color: colors.ink2, lineHeight: 20 },
});
