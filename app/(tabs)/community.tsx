import { ComingSoon } from '@/components/ComingSoon';
import { modules } from '@/lib/modules';

const info = modules.find((m) => m.key === 'community')!;

export default function Page() {
  return <ComingSoon icon={info.icon} tint={info.tint} title={info.title} tagline={info.tagline} points={info.points} />;
}
