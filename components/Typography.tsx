import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors } from '@/lib/theme';

/** Big page title, e.g. "Good evening, Akash 👋" */
export const Hello = ({ style, ...p }: TextProps) => <Text style={[s.hello, style]} {...p} />;

/** Grey 12px helper text */
export const Muted = ({ style, ...p }: TextProps) => <Text style={[s.muted, style]} {...p} />;

/** Bold body text */
export const Bold = ({ style, ...p }: TextProps) => <Text style={[s.bold, style]} {...p} />;

/** Tiny grey disclaimer text */
export const Fine = ({ style, ...p }: TextProps) => <Text style={[s.fine, style]} {...p} />;

const s = StyleSheet.create({
  hello: { fontSize: 21, fontWeight: '800', color: colors.ink },
  muted: { fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 17 },
  bold: { fontSize: 14, fontWeight: '700', color: colors.ink },
  fine: { fontSize: 10, color: colors.muted, lineHeight: 15, marginTop: 9, marginHorizontal: 2, marginBottom: 2 },
});
