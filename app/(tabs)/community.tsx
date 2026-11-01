import { router } from 'expo-router';
import { useState } from 'react';
import { BoardComposer } from '@/components/BoardComposer';
import { BoardPostCard } from '@/components/BoardPostCard';
import { Button } from '@/components/Button';
import { ItemCard } from '@/components/ItemCard';
import { NoticeCard } from '@/components/NoticeCard';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { Fine } from '@/components/Typography';
import { deleteBoardPost, listAnnouncements, listBoard, listGroups } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ago } from '@/lib/format';
import { isAdmin } from '@/lib/types';
import { useLoad } from '@/lib/useLoad';

type Tab = 'notices' | 'board' | 'chats';

export default function CommunityTab() {
  const { profile } = useAuth();
  const toast = useToast();
  const admin = isAdmin(profile?.role);
  const [tab, setTab] = useState<Tab>('notices');
  const { data, error, loading, refreshing, refresh, reload } = useLoad(async () => {
    const [notices, board, groups] = await Promise.all([listAnnouncements(), listBoard(), listGroups()]);
    return { notices, board, groups };
  });

  const right =
    tab === 'notices' && admin ? (
      <Button small icon="add" title="Notice" onPress={() => router.push('/community/notice-new')} />
    ) : tab === 'chats' ? (
      <Button small icon="add" title="Group" onPress={() => router.push('/community/group-new')} />
    ) : undefined;

  async function removePost(id: string) {
    try {
      await deleteBoardPost(id);
      reload();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  return (
    <Screen title="Community" subtitle="Everything important, without 200-message WhatsApp threads." right={right} onRefresh={refresh} refreshing={refreshing}>
      <Segmented
        options={[
          { key: 'notices', label: 'Notices', count: data?.notices.length },
          { key: 'board', label: 'Board' },
          { key: 'chats', label: 'Chats' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : tab === 'notices' ? (
        data!.notices.length ? (
          data!.notices.map((n) => <NoticeCard key={n.id} notice={n} me={profile!.id} canManage={admin} onChanged={reload} />)
        ) : (
          <EmptyState icon="megaphone-outline" tint="purple" title="No notices yet" text="Society announcements and events will appear here." />
        )
      ) : tab === 'board' ? (
        <>
          <BoardComposer onPosted={reload} />
          {data!.board.length ? (
            data!.board.map((p) => (
              <BoardPostCard key={p.id} post={p} canDelete={p.author_id === profile!.id || admin} onDelete={() => removePost(p.id)} />
            ))
          ) : (
            <EmptyState icon="people-outline" tint="purple" title="The board is empty" text="Ask for help, lend something, or recommend a neighbour." />
          )}
          <Fine>Be kind. Posts follow the community guidelines and can be removed by your Society Admin.</Fine>
        </>
      ) : data!.groups.length ? (
        <>
          {data!.groups.map((g) => {
            const last = g.messages[0];
            return (
              <ItemCard
                key={g.id}
                icon="chatbubbles-outline"
                tint="purple"
                title={g.name}
                subtitle={last ? last.body : g.description ?? 'No messages yet'}
                meta={last ? ago(last.created_at) : undefined}
                onPress={() => router.push(`/community/chat/${g.id}`)}
              />
            );
          })}
          <Fine>Group chats are moderated under the same community guidelines.</Fine>
        </>
      ) : (
        <EmptyState
          icon="chatbubbles-outline"
          tint="purple"
          title="No groups yet"
          text="Start one for your tower, a hobby, or parents."
          action={{ title: 'Create a group', onPress: () => router.push('/community/group-new') }}
        />
      )}
    </Screen>
  );
}
