import { StyleSheet, Text, View } from 'react-native';
import { flatOf, time } from '@/lib/format';
import { colors, font } from '@/lib/theme';
import type { Message } from '@/lib/types';
import { Avatar } from './Avatar';

export function ChatBubble({ msg, mine, showName }: { msg: Message; mine: boolean; showName: boolean }) {
  return (
    <View style={[s.row, mine && s.rowMine]}>
      {!mine ? <View style={{ width: 32 }}>{showName ? <Avatar name={msg.author?.full_name ?? '?'} size={32} /> : null}</View> : null}
      <View style={[s.bubble, mine ? s.mine : s.theirs]}>
        {!mine && showName ? (
          <Text style={s.name}>
            {msg.author?.full_name} {flatOf(msg.author) ? `· ${flatOf(msg.author)}` : ''}
          </Text>
        ) : null}
        <Text style={[s.body, mine && { color: colors.white }]}>{msg.body}</Text>
        <Text style={[s.time, mine && { color: 'rgba(255,255,255,0.7)' }]}>{time(msg.created_at)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 6, paddingRight: 40 },
  rowMine: { justifyContent: 'flex-end', paddingRight: 0, paddingLeft: 60 },
  bubble: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18, maxWidth: '100%' },
  mine: { backgroundColor: colors.green, borderBottomRightRadius: 6 },
  theirs: { backgroundColor: colors.white, borderBottomLeftRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  name: { ...font('700'), fontSize: 12, color: colors.green, marginBottom: 2 },
  body: { ...font('400'), fontSize: 15, color: colors.ink, lineHeight: 21 },
  time: { ...font('400'), fontSize: 10, color: colors.faint, alignSelf: 'flex-end', marginTop: 2 },
});
