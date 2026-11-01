import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/lib/theme';
import { Icon, type IconName } from './Icon';

type Props = { icon: IconName; label: string; onPress: () => void; danger?: boolean };

/** Rounded shortcut button that sits on the green Home hero. */
export function QuickAction({ icon, label, onPress, danger }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.wrap, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
      <View style={[s.circle, danger && s.danger]}>
        <Icon name={icon} size={24} color={danger ? '#ffd9d3' : colors.white} />
      </View>
      <Text style={s.label}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', flex: 1 },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  danger: { backgroundColor: 'rgba(230,72,52,0.35)', borderColor: 'rgba(255,140,120,0.45)' },
  label: { ...font('600'), color: colors.white, fontSize: 12, marginTop: 8, opacity: 0.95 },
});
