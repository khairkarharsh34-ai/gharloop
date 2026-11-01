import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';

/** Emoji icon that sits in a soft green pill when its tab is active. */
const icon =
  (emoji: string) =>
  ({ focused }: { focused: boolean }) => (
    <View style={[s.pill, focused && s.pillOn]}>
      <Text style={[s.emoji, !focused && s.dim]}>{emoji}</Text>
    </View>
  );

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 78 + insets.bottom,
          paddingTop: 8,
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarIconStyle: { width: 56, height: 30 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('🏠') }} />
      <Tabs.Screen name="resolve" options={{ title: 'Resolve', tabBarIcon: icon('🛠️') }} />
      <Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="activities" options={{ title: 'Activities', tabBarIcon: icon('🎯') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  pill: { width: 56, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pillOn: { backgroundColor: colors.soft },
  emoji: { fontSize: 18 },
  dim: { opacity: 0.55 },
});
