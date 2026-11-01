import { Share, StyleSheet, Text, View } from 'react-native';
import { iconForVisitor } from '@/lib/categories';
import { when } from '@/lib/format';
import { visitorStatus } from '@/lib/status';
import { colors, font } from '@/lib/theme';
import type { Visitor } from '@/lib/types';
import { Button } from './Button';
import { Card, Row } from './Card';
import { IconChip } from './IconChip';
import { Pill } from './Pill';

type Props = { v: Visitor; onCancel?: () => void };

/** A resident's visitor pass with the 6-digit gate code. */
export function VisitorPass({ v, onCancel }: Props) {
  const st = visitorStatus[v.status];
  const active = v.status === 'expected';
  const share = () =>
    Share.share({ message: `Your entry code for ${v.name}: ${v.code}\nShow this at the gate. (Ghar Loop)` }).catch(() => undefined);
  return (
    <Card>
      <Row>
        <Row style={{ justifyContent: 'flex-start', flex: 1 }}>
          <IconChip icon={iconForVisitor(v.purpose)} tint="slate" />
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{v.name}</Text>
            <Text style={s.meta}>
              {v.status === 'inside' && v.entered_at ? `Entered ${when(v.entered_at)}` : v.status === 'left' && v.left_at ? `Left ${when(v.left_at)}` : `Expected ${when(v.expected_at)}`}
            </Text>
          </View>
        </Row>
        <Pill label={st.label} tone={st.tone} />
      </Row>
      {active ? (
        <>
          <View style={s.codeBox}>
            <Text style={s.codeLabel}>GATE CODE</Text>
            <Text style={s.code}>{v.code.split('').join(' ')}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Share code" icon="share-social-outline" variant="secondary" small onPress={share} style={{ flex: 1 }} />
            {onCancel ? <Button title="Cancel" variant="ghost" small onPress={onCancel} /> : null}
          </View>
        </>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  name: { ...font('700'), fontSize: 15, color: colors.ink },
  meta: { ...font('400'), fontSize: 12, color: colors.muted, marginTop: 2 },
  codeBox: { backgroundColor: colors.soft, borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginVertical: 12 },
  codeLabel: { ...font('700'), fontSize: 10, color: colors.green, letterSpacing: 1.5 },
  code: { ...font('800'), fontSize: 30, color: colors.greenDark, letterSpacing: 4, marginTop: 2 },
});
