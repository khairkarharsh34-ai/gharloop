import { StyleSheet, Text, View } from 'react-native';
import { tints, type Tint } from '@/lib/theme';

const order: Tint[] = ['green', 'blue', 'purple', 'orange', 'teal', 'rose', 'gold'];

/** Round avatar with the person's initials. Same name → same colour. */
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '🙂';
  const hash = [...name].reduce((n, c) => n + c.charCodeAt(0), 0);
  const t = tints[order[hash % order.length]];
  return (
    <View style={[s.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: t.bg }]}>
      <Text style={[s.text, { color: t.fg, fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '800', letterSpacing: 0.3 },
});
