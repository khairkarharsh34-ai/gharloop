import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '@/lib/theme';
import { Icon, type IconName } from './Icon';

export type ChipOption<T extends string> = { value: T; label: string; icon?: IconName };

/** Wrapping row of choice chips; one can be selected. */
export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <View style={s.block}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={s.wrap}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <Pressable key={o.value} onPress={() => onChange(o.value)} style={[s.chip, on && s.on]}>
              {o.icon ? <Icon name={o.icon} size={15} color={on ? colors.white : colors.ink2} /> : null}
              <Text style={[s.text, on && s.textOn]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  block: { marginTop: 14 },
  label: { ...font('600'), fontSize: 13, color: colors.ink2, marginBottom: 8, marginLeft: 2 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.field,
  },
  on: { backgroundColor: colors.green, borderColor: colors.green },
  text: { ...font('600'), fontSize: 13, color: colors.ink2 },
  textOn: { color: colors.white },
});
