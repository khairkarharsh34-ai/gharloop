import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow, type Tint } from '@/lib/theme';
import type { IconName } from './Icon';
import { IconChip } from './IconChip';

type Props = {
  icon?: IconName;
  tint?: Tint;
  left?: ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  right?: ReactNode;
  footer?: ReactNode;
  onPress?: () => void;
};

/** The standard list row card: icon/left element, title, subtitle, meta line, right pill, optional footer. */
export function ItemCard({ icon, tint, left, title, subtitle, meta, right, footer, onPress }: Props) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}>
      <View style={s.row}>
        {left ?? (icon ? <IconChip icon={icon} tint={tint} /> : null)}
        <View style={s.body}>
          <Text style={s.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={s.sub} numberOfLines={3}>
              {subtitle}
            </Text>
          ) : null}
          {meta ? <Text style={s.meta}>{meta}</Text> : null}
        </View>
        {right}
      </View>
      {footer}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 10,
    ...shadow,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  body: { flex: 1 },
  title: { ...font('700'), fontSize: 15, color: colors.ink, letterSpacing: -0.1 },
  sub: { ...font('400'), fontSize: 13, color: colors.ink2, marginTop: 3, lineHeight: 19 },
  meta: { ...font('400'), fontSize: 12, color: colors.muted, marginTop: 5 },
});
