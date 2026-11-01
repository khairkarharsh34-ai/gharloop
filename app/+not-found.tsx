import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/States';

export default function NotFound() {
  return (
    <Screen>
      <EmptyState icon="compass-outline" title="Page not found" text="This link doesn't go anywhere." action={{ title: 'Go home', onPress: () => router.replace('/') }} />
    </Screen>
  );
}
