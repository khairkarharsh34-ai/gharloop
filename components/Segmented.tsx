import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/lib/theme';

type Option<T extends string> = { key: T; label: string; count?: number };

/** Pill-style tab switcher, e.g. Notices | Board | Chats. */
export function Segmented<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={s.wrap}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} style={[s.item, on && s.on]}>
            <Text style={[s.text, on && s.textOn]}>
              {o.label}
              {o.count ? <Text style={s.count}>  {o.count}</Text> : null}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: '#ebe8df', borderRadius: 14, padding: 4, marginBottom: 16 },
  item: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  on: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  text: { ...font('600'), fontSize: 14, color: colors.muted },
  textOn: { color: colors.green, ...font('700') },
  count: { ...font('700'), color: colors.marigold },
});
