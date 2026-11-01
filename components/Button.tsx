import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '@/lib/theme';

type Variant = 'primary' | 'secondary' | 'danger';

const look: Record<Variant, { bg: string; fg: string }> = {
  primary: { bg: colors.green, fg: colors.white },
  secondary: { bg: colors.secondary, fg: colors.green },
  danger: { bg: colors.redBg, fg: colors.red },
};

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  full?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', full, loading, disabled, style }: Props) {
  const t = look[variant];
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: t.bg, opacity: off ? 0.55 : pressed ? 0.8 : 1 },
        full && s.full,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={t.fg} size="small" /> : <Text style={[s.text, { color: t.fg }]}>{title}</Text>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    borderRadius: radius.button,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  full: { alignSelf: 'stretch', marginTop: 9 },
  text: { fontWeight: '800', fontSize: 13 },
});
