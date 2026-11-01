import { useLocalSearchParams } from 'expo-router';
import { ComingSoon } from '@/components/ComingSoon';

const pages: Record<string, { icon: string; title: string; tagline: string }> = {
  services: { icon: '🛠️', title: 'Services & Resident Businesses', tagline: 'Find help your neighbours actually use.' },
  needhelp: { icon: '🆘', title: 'Need Help', tagline: 'What do you need help with?' },
  funds: { icon: '💰', title: 'Maintenance Funds', tagline: 'Visibility creates accountability — not blame.' },
  gate: { icon: '🚪', title: 'Gate & Visitors', tagline: 'Pre-approve entries and reach security fast.' },
  guidelines: { icon: '📘', title: 'Community guidelines', tagline: 'How we keep Padosi friendly and useful.' },
  grievance: { icon: '📮', title: 'Report a problem', tagline: 'Contact the Grievance Officer.' },
  privacy: { icon: '🔒', title: 'Privacy policy & data', tagline: 'What we store and why.' },
};

/** Temporary page for modules that come in later updates. */
export default function ModulePage() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const page = pages[name] ?? { icon: '🧭', title: 'Not found', tagline: 'This page does not exist.' };
  return <ComingSoon {...page} showBack />;
}
