import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatBubble } from '@/components/ChatBubble';
import { Icon } from '@/components/Icon';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { getGroup, getMessage, listMessages, sendMessage, subscribeMessages } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, font } from '@/lib/theme';
import type { Message } from '@/lib/types';

/** Live group chat: new messages arrive instantly for everyone in the group. */
export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollViewInstance>(null);
  const [name, setName] = useState('');
  const [msgs, setMsgs] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const add = useCallback((m: Message) => setMsgs((list) => (list?.some((x) => x.id === m.id) ? list : [...(list ?? []), m])), []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [g, list] = await Promise.all([getGroup(id), listMessages(id)]);
      setName(g.name);
      setMsgs(list);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    load();
    return subscribeMessages(id, async (newId) => {
      try {
        add(await getMessage(newId));
      } catch {
        /* ignore: we'll see it on next refresh */
      }
    });
  }, [id, load, add]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setText('');
    try {
      add(await sendMessage(id, body));
    } catch (e) {
      setText(body);
      toast((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/community'))} hitSlop={10}>
          <Icon name="chevron-back" size={26} color={colors.green} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.title} numberOfLines={1}>{name || 'Group chat'}</Text>
          <Text style={s.sub}>Live · visible to your society</Text>
        </View>
      </View>
      <ScrollView
        ref={scroll}
        contentContainerStyle={s.list}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
        keyboardShouldPersistTaps="handled"
      >
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !msgs ? (
          <Loading />
        ) : !msgs.length ? (
          <EmptyState icon="chatbubble-ellipses-outline" tint="purple" title="Say hello 👋" text="Be the first to post in this group." />
        ) : (
          msgs.map((m, i) => (
            <ChatBubble key={m.id} msg={m} mine={m.author_id === profile?.id} showName={i === 0 || msgs[i - 1].author_id !== m.author_id} />
          ))
        )}
      </ScrollView>
      <View style={[s.composer, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={colors.faint}
          style={s.input}
          multiline
          maxLength={2000}
          onSubmitEditing={send}
        />
        <Pressable onPress={send} disabled={!text.trim() || sending} style={[s.send, (!text.trim() || sending) && { opacity: 0.4 }]}>
          <Icon name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  title: { ...font('800'), fontSize: 18, color: colors.ink },
  sub: { ...font('400'), fontSize: 12, color: colors.green },
  list: { padding: 14, paddingBottom: 20, flexGrow: 1 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  input: {
    ...font('400'),
    flex: 1,
    maxHeight: 120,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.field,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
    outlineStyle: 'none' as never,
  },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
});
