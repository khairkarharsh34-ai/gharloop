import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius } from '@/lib/theme';

type Props = TextInputProps & { label?: string };

export function Input({ label, style, ...rest }: Props) {
  return (
    <View style={s.wrap}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.muted} style={[s.input, style]} {...rest} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 10 },
  label: { fontSize: 11, fontWeight: '700', color: colors.muted, marginBottom: 4, marginLeft: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.button,
    padding: 11,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
  },
});
