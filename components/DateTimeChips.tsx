import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { badge } from '@/lib/format';
import { colors, font } from '@/lib/theme';

const TIMES = ['06:00', '07:00', '09:00', '11:00', '14:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
const label = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`;
};

type Props = { value: Date; onChange: (d: Date) => void; days?: number; withTime?: boolean; label?: string };

/** No-library date (and time) picker: a strip of the next N days, then time chips. */
export function DateTimeChips({ value, onChange, days = 14, withTime = true, label: title }: Props) {
  const list = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: days }, (_, i) => new Date(start.getTime() + i * 86400000));
  }, [days]);

  const setDay = (d: Date) => {
    const n = new Date(d);
    n.setHours(value.getHours(), value.getMinutes(), 0, 0);
    onChange(n);
  };
  const setTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const n = new Date(value);
    n.setHours(h, m, 0, 0);
    onChange(n);
  };
  const cur = `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;

  return (
    <View style={{ marginTop: 14 }}>
      {title ? <Text style={s.label}>{title}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {list.map((d, i) => {
          const b = badge(d);
          const on = d.toDateString() === value.toDateString();
          return (
            <Pressable key={i} onPress={() => setDay(d)} style={[s.day, on && s.on]}>
              <Text style={[s.dow, on && s.white]}>{i === 0 ? 'TODAY' : b.dow}</Text>
              <Text style={[s.date, on && s.white]}>{b.date}</Text>
              <Text style={[s.dow, on && s.white]}>{b.month}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {withTime ? (
        <View style={s.times}>
          {TIMES.map((t) => (
            <Pressable key={t} onPress={() => setTime(t)} style={[s.time, cur === t && s.on]}>
              <Text style={[s.timeText, cur === t && s.white]}>{label(t)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  label: { ...font('600'), fontSize: 13, color: colors.ink2, marginBottom: 8, marginLeft: 2 },
  day: {
    width: 58,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.field,
  },
  on: { backgroundColor: colors.green, borderColor: colors.green },
  dow: { ...font('700'), fontSize: 10, color: colors.muted, letterSpacing: 0.5 },
  date: { ...font('800'), fontSize: 20, color: colors.ink, marginVertical: 1 },
  white: { color: colors.white },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  time: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.field },
  timeText: { ...font('600'), fontSize: 13, color: colors.ink2 },
});
