import { Image } from 'react-native';

// White house mark + "Gharloop" wordmark (for green backgrounds). Source: brand/gharloop-logo-horizontal-white.svg
const logo = require('../assets/logo-white.png');
const RATIO = 550 / 132;

export function Logo({ size = 40 }: { size?: number }) {
  return <Image source={logo} style={{ height: size, width: size * RATIO }} resizeMode="contain" accessibilityLabel="Ghar Loop" />;
}
