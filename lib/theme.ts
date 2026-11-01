import { Platform, type ViewStyle } from 'react-native';

// Padosi design system v2: deep "neem" green for trust,
// marigold for warmth, and a soft cream background instead of cold grey.
export const colors = {
  // Brand
  green: '#1d5c45', // primary: buttons, active tab, hero
  greenDark: '#143f30',
  soft: '#e4f1ea', // light green fills
  marigold: '#f2a33a', // warm accent
  marigoldSoft: '#fff2dc',

  // Text
  ink: '#16211c',
  ink2: '#3b4842',
  muted: '#6e7a73',
  faint: '#a3aca6',

  // Surfaces
  bg: '#f6f4ee',
  card: '#ffffff',
  line: '#ece9e1',
  field: '#fbfaf7',
  secondary: '#e9f2ed',
  white: '#ffffff',
  outer: '#e9e6dd', // around the app on a laptop browser

  // Status
  gold: '#9a5b0b',
  goldBg: '#fff2dc',
  red: '#c0392b',
  redBg: '#fdecea',
  blue: '#2f5fd0',
  blueBg: '#e9effc',
};

/** Pastel chip colours, one per module, so each section is easy to spot. */
export const tints = {
  green: { bg: '#e4f1ea', fg: '#1d5c45' },
  blue: { bg: '#e9effc', fg: '#2f5fd0' },
  purple: { bg: '#efeafb', fg: '#6a4bc4' },
  orange: { bg: '#fff0e0', fg: '#c26a12' },
  teal: { bg: '#e2f4f3', fg: '#16807a' },
  rose: { bg: '#fdebee', fg: '#c2394f' },
  gold: { bg: '#fff5d6', fg: '#9a6b00' },
  slate: { bg: '#eceff2', fg: '#43505c' },
} as const;
export type Tint = keyof typeof tints;

export const radius = { card: 20, button: 14, pill: 20, chip: 14, field: 14 };

export const maxWidth = 460;

/** Soft, low shadow for cards. */
export const shadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 1px 2px rgba(22,33,28,0.04), 0 6px 18px rgba(22,33,28,0.05)' } as ViewStyle,
  ios: { shadowColor: '#16211c', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  default: { elevation: 2 },
})!;

// ---------- Inter font ----------
// Custom fonts need one font file per weight (Android can't fake bold),
// so styles use font('700') instead of fontWeight: '700'.
const interFamily = {
  '400': 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
  '800': 'Inter_800ExtraBold',
  '900': 'Inter_900Black',
} as const;
export type FontWeight = keyof typeof interFamily;
export const font = (weight: FontWeight = '400') => ({ fontFamily: interFamily[weight] });
