import { useLocalSearchParams } from 'expo-router';
import { ComingSoon } from '@/components/ComingSoon';
import { gate, modules } from '@/lib/modules';
import type { Tint } from '@/lib/theme';

type Page = { icon: string; tint: Tint; title: string; tagline: string; points?: string[] };

const extra: Record<string, Page> = {
  guidelines: { icon: '📘', tint: 'blue', title: 'Community guidelines', tagline: 'How we keep Padosi friendly and useful.' },
  grievance: { icon: '📮', tint: 'rose', title: 'Report a problem', tagline: 'Contact the Grievance Officer.' },
  privacy: { icon: '🔒', tint: 'slate', title: 'Privacy & data', tagline: 'What we store and why.' },
};

/** Temporary page for modules that come in later updates. */
export default function ModulePage() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const page: Page = [...modules, gate].find((m) => m.key === name) ??
    extra[name] ?? { icon: '🧭', tint: 'slate', title: 'Not found', tagline: 'This page does not exist.' };
  return <ComingSoon {...page} showBack />;
}
