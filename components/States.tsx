import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';
import { Button } from './Button';
import { Card } from './Card';

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={s.center}>
      <ActivityIndicator color={colors.green} />
      <Text style={s.text}>{label}</Text>
    </View>
  );
}

type EmptyProps = { icon?: string; title: string; text?: string; action?: { title: string; onPress: () => void } };

export function EmptyState({ icon = '🌱', title, text, action }: EmptyProps) {
  return (
    <Card style={s.box}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.title}>{title}</Text>
      {text ? <Text style={s.text}>{text}</Text> : null}
      {action ? <Button title={action.title} onPress={action.onPress} variant="secondary" full /> : null}
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card style={s.box}>
      <Text style={s.icon}>⚠️</Text>
      <Text style={s.title}>Something went wrong</Text>
      <Text style={s.text}>{message}</Text>
      {onRetry ? <Button title="Try again" onPress={onRetry} variant="secondary" full /> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  center: { padding: 30, alignItems: 'center', gap: 8 },
  box: { alignItems: 'center', paddingVertical: 22 },
  icon: { fontSize: 30 },
  title: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: 6, textAlign: 'center' },
  text: { fontSize: 12, color: colors.muted, marginTop: 4, textAlign: 'center', lineHeight: 17 },
});
