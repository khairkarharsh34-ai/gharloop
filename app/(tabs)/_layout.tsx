import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@/components/Icon';
import { SosBanner } from '@/components/SosBanner';
import { colors, font } from '@/lib/theme';

/** Outline icon normally, filled icon in a soft green pill when active. */
const icon =
  (name: string) =>
  ({ focused }: { focused: boolean }) => (
    <View style={[s.pill, focused && s.pillOn]}>
      <Icon
        name={(focused ? name : `${name}-outline`) as IconName}
        size={22}
        color={focused ? colors.green : colors.muted}
      />
    </View>
  );

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <SosBanner>
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
        tabBarLabelStyle: { ...font('600'), fontSize: 11, marginTop: 2 },
        tabBarIconStyle: { width: 56, height: 30 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="resolve" options={{ title: 'Resolve', tabBarIcon: icon('construct') }} />
      <Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: icon('chatbubbles') }} />
      <Tabs.Screen name="activities" options={{ title: 'Activities', tabBarIcon: icon('bicycle') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person-circle') }} />
      </Tabs>
    </SosBanner>
  );
}

const s = StyleSheet.create({
  pill: { width: 56, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pillOn: { backgroundColor: colors.soft },
});
