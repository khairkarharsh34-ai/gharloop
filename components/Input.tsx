import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, font } from '@/lib/theme';

type Props = TextInputProps & { label?: string };

export function Input({ label, style, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.wrap}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.faint}
        style={[s.input, focused && s.focused, style]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 14 },
  label: { ...font('600'), fontSize: 13, color: colors.ink2, marginBottom: 6, marginLeft: 2 },
  input: { ...font('400'),
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.field,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.field,
    outlineStyle: 'none' as never,
  },
  focused: { borderColor: colors.green, backgroundColor: colors.white },
});
