import { useState } from 'react';
import { createBoardPost } from '@/lib/api';
import { boardKinds } from '@/lib/categories';
import type { BoardKind } from '@/lib/types';
import { Button } from './Button';
import { Card } from './Card';
import { ChipSelect } from './ChipSelect';
import { Input } from './Input';
import { useToast } from './Toast';

/** Quick "ask / lend / recommend" post box at the top of the board. */
export function BoardComposer({ onPosted }: { onPosted: () => void }) {
  const toast = useToast();
  const [kind, setKind] = useState<BoardKind>('ask');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  async function post() {
    if (body.trim().length < 3) return;
    setBusy(true);
    try {
      await createBoardPost(kind, body.trim());
      setBody('');
      toast('Posted to the board');
      onPosted();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <ChipSelect options={boardKinds} value={kind} onChange={(v) => setKind(v as BoardKind)} />
      <Input
        value={body}
        onChangeText={setBody}
        placeholder={kind === 'ask' ? 'Need something? Ask your neighbours…' : kind === 'lend' ? 'What can you lend or give away?' : kind === 'recommend' ? 'Who do you recommend, and why?' : 'Share with your society…'}
        multiline
        maxLength={1000}
      />
      <Button title="Post" icon="send" small onPress={post} loading={busy} disabled={body.trim().length < 3} full />
    </Card>
  );
}
