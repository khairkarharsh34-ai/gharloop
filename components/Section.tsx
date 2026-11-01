import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/lib/theme';

type Props = { title: string; action?: { label: string; onPress: () => void } };

/** Section heading with an optional "See all"-style link on the right. */
export function Section({ title, action }: Props) {
  return (
    <View style={s.row}>
      <Text style={s.title}>{title}</Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text style={s.action}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 26,
    marginBottom: 12,
    marginHorizontal: 2,
  },
  title: { ...font('800'), fontSize: 18, color: colors.ink, letterSpacing: -0.3 },
  action: { ...font('700'), fontSize: 13, color: colors.green },
});
