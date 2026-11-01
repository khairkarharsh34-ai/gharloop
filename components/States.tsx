import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, type Tint, font } from '@/lib/theme';
import { Button } from './Button';
import { Card } from './Card';
import type { IconName } from './Icon';
import { IconChip } from './IconChip';

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={s.center}>
      <ActivityIndicator color={colors.green} />
      <Text style={s.text}>{label}</Text>
    </View>
  );
}

type EmptyProps = {
  icon?: IconName;
  tint?: Tint;
  title: string;
  text?: string;
  action?: { title: string; onPress: () => void };
};

export function EmptyState({ icon = 'leaf-outline', tint = 'green', title, text, action }: EmptyProps) {
  return (
    <Card style={s.box}>
      <IconChip icon={icon} tint={tint} size={56} />
      <Text style={s.title}>{title}</Text>
      {text ? <Text style={s.text}>{text}</Text> : null}
      {action ? <Button title={action.title} onPress={action.onPress} variant="secondary" full /> : null}
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card style={s.box}>
      <IconChip icon="cloud-offline-outline" tint="rose" size={56} />
      <Text style={s.title}>Something went wrong</Text>
      <Text style={s.text}>{message}</Text>
      {onRetry ? <Button title="Try again" onPress={onRetry} variant="secondary" full /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.bg },
  box: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 22 },
  title: { ...font('800'), fontSize: 16, color: colors.ink, marginTop: 14, textAlign: 'center' },
  text: { ...font('400'), fontSize: 13, color: colors.muted, marginTop: 6, textAlign: 'center', lineHeight: 19 },
});
