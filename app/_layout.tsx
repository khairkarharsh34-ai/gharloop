import { router, Stack, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { Loading } from '@/components/States';
import { ToastProvider } from '@/components/Toast';
import { Muted } from '@/components/Typography';
import { AuthProvider, useAuth } from '@/lib/auth';
import { appFonts } from '@/lib/fonts';
import { isConfigured } from '@/lib/supabase';
import { colors, maxWidth } from '@/lib/theme';

export default function RootLayout() {
  // Inter + icon font. If loading fails we still show the app with the system font.
  const [fontsLoaded, fontError] = useFonts(appFonts);
  if (!fontsLoaded && !fontError) return <View style={s.outer} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* On a laptop browser, keep the app phone-width like the prototype. */}
      <View style={s.outer}>
        <View style={s.app}>
          <ToastProvider>
            {isConfigured ? (
              <AuthProvider>
                <Routes />
              </AuthProvider>
            ) : (
              <MissingKeys />
            )}
          </ToastProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

function Routes() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const area = segments[0] as string | undefined;

  // Send people to the right place: login → waiting for approval → the app.
  useEffect(() => {
    if (loading) return;
    const inAuth = area === '(auth)';
    const inPending = area === 'pending';
    if (!session) {
      if (!inAuth) router.replace('/sign-in');
    } else if (profile?.status !== 'approved') {
      if (!inPending) router.replace('/pending');
    } else if (inAuth || inPending) {
      router.replace('/');
    }
  }, [loading, session, profile?.status, area]);

  if (loading) return <Loading />;

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}

function MissingKeys() {
  return (
    <Screen title="Almost there" subtitle="The app isn't connected to its database yet.">
      <Muted>
        Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to the .env file (or to your web host's
        environment variables), then restart or redeploy.
      </Muted>
    </Screen>
  );
}

const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: Platform.OS === 'web' ? colors.outer : colors.bg, alignItems: 'center' },
  app: { flex: 1, width: '100%', maxWidth, backgroundColor: colors.bg, overflow: 'hidden' },
});
