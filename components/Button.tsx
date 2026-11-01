import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '@/lib/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const look: Record<Variant, { bg: string; fg: string }> = {
  primary: { bg: colors.green, fg: colors.white },
  secondary: { bg: colors.secondary, fg: colors.green },
  danger: { bg: colors.redBg, fg: colors.red },
  ghost: { bg: 'transparent', fg: colors.green },
};

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: string;
  full?: boolean;
  small?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', icon, full, small, loading, disabled, style }: Props) {
  const t = look[variant];
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        s.btn,
        small && s.small,
        { backgroundColor: t.bg, opacity: off ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        full && s.full,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={t.fg} size="small" />
      ) : (
        <Text style={[s.text, small && s.smallText, { color: t.fg }]}>
          {icon ? `${icon}  ` : ''}
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    borderRadius: radius.button,
    paddingHorizontal: 18,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: { minHeight: 40, paddingHorizontal: 14, borderRadius: 12 },
  full: { alignSelf: 'stretch', marginTop: 12 },
  text: { fontWeight: '700', fontSize: 15, letterSpacing: -0.1 },
  smallText: { fontSize: 14 },
});
