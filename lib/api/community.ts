// Community: announcements + RSVP, board, group chats (live).
import type { Announcement, BoardKind, BoardPost, ChatGroup, Message } from '../types';
import { mustChange, myId, person, run, supabase } from './client';

export const listAnnouncements = () =>
  run<Announcement[]>(
    supabase.from('announcements').select(`*, ${person('author', 'announcements_author_id_fkey')}, rsvps(user_id)`).order('created_at', { ascending: false }),
  );

export type NewAnnouncement = { title: string; body: string; event_at: string | null; location: string | null };
export const createAnnouncement = (input: NewAnnouncement) => run(supabase.from('announcements').insert(input));
export const deleteAnnouncement = (id: string) => mustChange(supabase.from('announcements').delete().eq('id', id).select('id'));

export async function setRsvp(announcementId: string, going: boolean) {
  if (going) await run(supabase.from('rsvps').insert({ announcement_id: announcementId }));
  else await run(supabase.from('rsvps').delete().eq('announcement_id', announcementId).eq('user_id', await myId()));
}

export const listBoard = () =>
  run<BoardPost[]>(supabase.from('board_posts').select(`*, ${person('author', 'board_posts_author_id_fkey')}`).order('created_at', { ascending: false }));
export const createBoardPost = (kind: BoardKind, body: string) => run(supabase.from('board_posts').insert({ kind, body }));
export const deleteBoardPost = (id: string) => mustChange(supabase.from('board_posts').delete().eq('id', id).select('id'));

export const listGroups = () =>
  run<ChatGroup[]>(
    supabase
      .from('chat_groups')
      .select('id, name, description, created_at, messages(body, created_at)')
      .order('created_at')
      .order('created_at', { referencedTable: 'messages', ascending: false })
      .limit(1, { referencedTable: 'messages' }),
  );

export const getGroup = (id: string) =>
  run<{ id: string; name: string; description: string | null }>(
    supabase.from('chat_groups').select('id, name, description').eq('id', id).single(),
  );

export const createGroup = (name: string, description: string) =>
  run<{ id: string }>(supabase.from('chat_groups').insert({ name, description }).select('id').single());

const MESSAGE = `id, body, created_at, author_id, ${person('author', 'messages_author_id_fkey')}`;

export async function listMessages(groupId: string) {
  const rows = await run<Message[]>(
    supabase.from('messages').select(MESSAGE).eq('group_id', groupId).order('created_at', { ascending: false }).limit(100),
  );
  return rows.reverse();
}

export const sendMessage = (groupId: string, body: string) =>
  run<Message>(supabase.from('messages').insert({ group_id: groupId, body }).select(MESSAGE).single());

export const getMessage = (id: string) => run<Message>(supabase.from('messages').select(MESSAGE).eq('id', id).single());

/** Calls onNew with each new message id in this group. Returns an unsubscribe function. */
export function subscribeMessages(groupId: string, onNew: (id: string) => void) {
  const channel = supabase
    .channel(`messages:${groupId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` }, (p) =>
      onNew((p.new as { id: string }).id),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
