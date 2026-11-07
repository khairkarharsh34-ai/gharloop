// SOS types and Indian emergency numbers.
import type { IconName } from '@/components/Icon';

export type SosKind = 'medical' | 'police' | 'fire' | 'other';

export const SOS_KINDS: { key: SosKind; label: string; icon: IconName; note: string; call?: Helpline }[] = [
  { key: 'medical', label: 'Medical', icon: 'medkit-outline', note: 'Medical emergency', call: { label: 'Ambulance', number: '108', icon: 'medkit-outline' } },
  { key: 'police', label: 'Police', icon: 'shield-outline', note: 'Police needed', call: { label: 'Police', number: '100', icon: 'shield-outline' } },
  { key: 'fire', label: 'Fire', icon: 'flame-outline', note: 'Fire emergency', call: { label: 'Fire brigade', number: '101', icon: 'flame-outline' } },
  { key: 'other', label: 'Other', icon: 'alert-circle-outline', note: 'Emergency at my flat' },
];

export type Helpline = { label: string; number: string; icon: IconName };

export const HELPLINES: Helpline[] = [
  { label: 'Police', number: '100', icon: 'shield-outline' },
  { label: 'Ambulance', number: '108', icon: 'medkit-outline' },
  { label: 'Fire', number: '101', icon: 'flame-outline' },
  { label: 'All emergencies', number: '112', icon: 'call-outline' },
  { label: 'Women helpline', number: '1091', icon: 'woman-outline' },
];
