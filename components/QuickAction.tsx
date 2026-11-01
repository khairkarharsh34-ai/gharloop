import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

type Props = { icon: string; label: string; onPress: () => void; danger?: boolean };

/** Round shortcut button that sits on the green Home hero. */
export function QuickAction({ icon, label, onPress, danger }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.wrap, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
      <View style={[s.circle, danger && s.danger]}>
        <Text style={s.icon}>{icon}</Text>
      </View>
      <Text style={s.label}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', flex: 1 },
  circle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  danger: { backgroundColor: 'rgba(255,92,72,0.28)', borderColor: 'rgba(255,140,120,0.45)' },
  icon: { fontSize: 22 },
  label: { color: colors.white, fontSize: 12, fontWeight: '600', marginTop: 7, opacity: 0.95 },
});
