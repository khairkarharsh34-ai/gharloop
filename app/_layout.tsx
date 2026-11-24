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
import { NOTICE_VERSION } from '@/lib/legal';
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
    if (area === 'reset-password') return; // reached from the reset email: stay there
    if (area === 'module') return; // privacy notice, guidelines, grievance: open to everyone
    const inAuth = area === '(auth)';
    const inPending = area === 'pending';
    const inConsent = area === 'consent';
    // undefined = consent can't be checked yet (005 not run), so nobody is blocked.
    const needsConsent = !!profile && profile.consent !== undefined && profile.consent !== NOTICE_VERSION;
    if (!session) {
      if (!inAuth && area !== 'join') router.replace('/sign-in'); // invite links work before login
    } else if (needsConsent) {
      if (!inConsent) router.replace('/consent');
    } else if (profile?.status !== 'approved') {
      if (!inPending) router.replace('/pending');
    } else if (inAuth || inPending || inConsent) {
      router.replace('/');
    }
  }, [loading, session, profile?.status, profile?.consent, area]);

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
