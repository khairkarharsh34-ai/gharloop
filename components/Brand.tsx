import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

/** Large logo block for the login and sign-up screens. */
export function Brand() {
  return (
    <View style={s.wrap}>
      <Text style={s.logo}>🏡</Text>
      <Text style={s.brand}>Padosi</Text>
      <Text style={s.tag}>Your community, made useful — and happier.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 30, marginBottom: 18 },
  logo: { fontSize: 44 },
  brand: { fontSize: 30, fontWeight: '900', color: colors.ink, marginTop: 4 },
  tag: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
