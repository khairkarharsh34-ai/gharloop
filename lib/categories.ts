// Choice lists used across forms, with an icon for each.
import type { IconName } from '@/components/Icon';
import type { Tint } from './theme';
import type { BoardKind, Visitor } from './types';

type Cat = { value: string; label: string; icon: IconName };

export const issueCategories: Cat[] = [
  { value: 'lift', label: 'Lift', icon: 'swap-vertical-outline' },
  { value: 'plumbing', label: 'Water / plumbing', icon: 'water-outline' },
  { value: 'electrical', label: 'Electrical', icon: 'flash-outline' },
  { value: 'security', label: 'Security', icon: 'shield-outline' },
  { value: 'cleanliness', label: 'Cleanliness', icon: 'trash-outline' },
  { value: 'parking', label: 'Parking', icon: 'car-outline' },
  { value: 'amenities', label: 'Gym / amenities', icon: 'barbell-outline' },
  { value: 'noise', label: 'Noise', icon: 'volume-high-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
];

export const helpCategories: (Cat & { tint: Tint; sub: string })[] = [
  { value: 'Plumbing', label: 'Plumbing', icon: 'water-outline', tint: 'blue', sub: 'Leaks & repairs' },
  { value: 'Electrical', label: 'Electrical', icon: 'flash-outline', tint: 'gold', sub: 'Power & wiring' },
  { value: 'AC Repair', label: 'AC Repair', icon: 'snow-outline', tint: 'teal', sub: 'Cooling issues' },
  { value: 'Cleaning', label: 'Cleaning', icon: 'sparkles-outline', tint: 'purple', sub: 'Home & deep clean' },
  { value: 'Pest Control', label: 'Pest Control', icon: 'bug-outline', tint: 'orange', sub: 'Home treatment' },
  { value: 'Carpentry', label: 'Carpentry', icon: 'hammer-outline', tint: 'slate', sub: 'Furniture & doors' },
  { value: 'Tutor', label: 'Tutor', icon: 'school-outline', tint: 'green', sub: 'School & skills' },
  { value: 'Babysitting', label: 'Babysitting', icon: 'happy-outline', tint: 'rose', sub: 'Trusted help' },
  { value: 'Domestic Help', label: 'Domestic Help', icon: 'home-outline', tint: 'teal', sub: 'Maid & cook' },
  { value: 'Moving', label: 'Moving', icon: 'cube-outline', tint: 'orange', sub: 'Shifting support' },
  { value: 'Tech Help', label: 'Tech Help', icon: 'laptop-outline', tint: 'blue', sub: 'Device support' },
  { value: 'Other', label: 'Other', icon: 'ellipsis-horizontal', tint: 'slate', sub: 'Something else' },
];

export const serviceTypes: Cat[] = [
  { value: 'Plumber', label: 'Plumber', icon: 'water-outline' },
  { value: 'Electrician', label: 'Electrician', icon: 'flash-outline' },
  { value: 'Maid', label: 'Maid', icon: 'sparkles-outline' },
  { value: 'Cook', label: 'Cook', icon: 'restaurant-outline' },
  { value: 'AC service', label: 'AC service', icon: 'snow-outline' },
  { value: 'Carpenter', label: 'Carpenter', icon: 'hammer-outline' },
  { value: 'Driver', label: 'Driver', icon: 'car-outline' },
  { value: 'Laundry', label: 'Laundry', icon: 'shirt-outline' },
  { value: 'Other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export const businessCategories: Cat[] = [
  { value: 'Bakery', label: 'Bakery', icon: 'cafe-outline' },
  { value: 'Tiffin', label: 'Tiffin / mess', icon: 'restaurant-outline' },
  { value: 'Spices', label: 'Spices & pickles', icon: 'leaf-outline' },
  { value: 'Fitness', label: 'Fitness', icon: 'fitness-outline' },
  { value: 'Tuition', label: 'Tuition', icon: 'school-outline' },
  { value: 'Boutique', label: 'Boutique', icon: 'shirt-outline' },
  { value: 'Other', label: 'Other', icon: 'storefront-outline' },
];
export const FOOD_CATEGORIES = ['Bakery', 'Tiffin', 'Spices'];

export const iconForService = (s: string): IconName => serviceTypes.find((t) => t.value === s)?.icon ?? 'call-outline';
export const iconForBusiness = (s: string): IconName =>
  businessCategories.find((t) => t.value === s)?.icon ?? 'storefront-outline';
export const iconForIssue = (s: string): IconName =>
  issueCategories.find((t) => t.value === s)?.icon ?? 'alert-circle-outline';
export const iconForHelp = (s: string): IconName => helpCategories.find((t) => t.value === s)?.icon ?? 'hand-left-outline';

export const boardKinds: { value: BoardKind; label: string; icon: IconName; tint: Tint }[] = [
  { value: 'ask', label: 'Ask', icon: 'help-circle-outline', tint: 'blue' },
  { value: 'lend', label: 'Lend / give', icon: 'gift-outline', tint: 'green' },
  { value: 'recommend', label: 'Recommend', icon: 'thumbs-up-outline', tint: 'orange' },
  { value: 'general', label: 'General', icon: 'chatbox-outline', tint: 'purple' },
];

export const visitorPurposes: { value: Visitor['purpose']; label: string; icon: IconName }[] = [
  { value: 'guest', label: 'Guest', icon: 'person-outline' },
  { value: 'delivery', label: 'Delivery', icon: 'cube-outline' },
  { value: 'service', label: 'Service', icon: 'construct-outline' },
  { value: 'cab', label: 'Cab', icon: 'car-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];
export const iconForVisitor = (p: Visitor['purpose']): IconName => visitorPurposes.find((v) => v.value === p)?.icon ?? 'person-outline';
