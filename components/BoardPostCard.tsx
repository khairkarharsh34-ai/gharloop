import { boardKinds } from '@/lib/categories';
import { ago, flatOf } from '@/lib/format';
import type { BoardPost } from '@/lib/types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { ItemCard } from './ItemCard';
import { Pill } from './Pill';

type Props = { post: BoardPost; canDelete: boolean; onDelete: () => void };

export function BoardPostCard({ post, canDelete, onDelete }: Props) {
  const kind = boardKinds.find((k) => k.value === post.kind)!;
  return (
    <ItemCard
      left={<Avatar name={post.author?.full_name ?? '?'} size={40} />}
      title={[post.author?.full_name, flatOf(post.author)].filter(Boolean).join(' · ')}
      subtitle={post.body}
      meta={ago(post.created_at)}
      right={<Pill label={kind.label} tone={post.kind === 'ask' ? 'blue' : post.kind === 'lend' ? 'green' : post.kind === 'recommend' ? 'gold' : 'grey'} />}
      footer={canDelete ? <Button title="Delete" variant="ghost" small onPress={onDelete} style={{ alignSelf: 'flex-end' }} /> : null}
    />
  );
}
