import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors, font } from '@/lib/theme';

/** Large page title */
export const Hello = ({ style, ...p }: TextProps) => <Text style={[s.hello, style]} {...p} />;

/** Grey helper text */
export const Muted = ({ style, ...p }: TextProps) => <Text style={[s.muted, style]} {...p} />;

/** Bold body text */
export const Bold = ({ style, ...p }: TextProps) => <Text style={[s.bold, style]} {...p} />;

/** Small uppercase label, e.g. "YOUR SOCIETY" */
export const Overline = ({ style, ...p }: TextProps) => <Text style={[s.overline, style]} {...p} />;

/** Tiny grey disclaimer text */
export const Fine = ({ style, ...p }: TextProps) => <Text style={[s.fine, style]} {...p} />;

const s = StyleSheet.create({
  hello: { ...font('800'), fontSize: 26, color: colors.ink, letterSpacing: -0.5 },
  muted: { ...font('400'), fontSize: 13, color: colors.muted, marginTop: 3, lineHeight: 19 },
  bold: { ...font('700'), fontSize: 15, color: colors.ink, letterSpacing: -0.1 },
  overline: { ...font('800'), fontSize: 11, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase' },
  fine: { ...font('400'), fontSize: 11, color: colors.faint, lineHeight: 16, marginTop: 12, marginHorizontal: 4, textAlign: 'center' },
});

/** Red error line under a form. */
export const ErrorText = ({ children }: { children: string | null }) =>
  children ? <Text style={{ ...font('500'), color: colors.red, fontSize: 13, marginTop: 12 }}>{children}</Text> : null;
