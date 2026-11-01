import { useLocalSearchParams } from 'expo-router';
import { ComingSoon } from '@/components/ComingSoon';
import { gate, modules } from '@/lib/modules';
import type { IconName } from '@/components/Icon';
import type { Tint } from '@/lib/theme';

type Page = { icon: IconName; tint: Tint; title: string; tagline: string; points?: string[] };

const extra: Record<string, Page> = {
  guidelines: { icon: 'book-outline', tint: 'blue', title: 'Community guidelines', tagline: 'How we keep Padosi friendly and useful.' },
  grievance: { icon: 'mail-outline', tint: 'rose', title: 'Report a problem', tagline: 'Contact the Grievance Officer.' },
  privacy: { icon: 'lock-closed-outline', tint: 'slate', title: 'Privacy & data', tagline: 'What we store and why.' },
};

/** Temporary page for modules that come in later updates. */
export default function ModulePage() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const page: Page = [...modules, gate].find((m) => m.key === name) ??
    extra[name] ?? { icon: 'compass-outline', tint: 'slate', title: 'Not found', tagline: 'This page does not exist.' };
  return <ComingSoon {...page} showBack />;
}
