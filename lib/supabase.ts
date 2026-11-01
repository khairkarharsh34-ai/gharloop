import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

if (Platform.OS !== 'web') require('react-native-url-polyfill/auto');

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** False until the two keys are set in .env (or on the web host). */
export const isConfigured = Boolean(url && anonKey);

export const supabase = createClient(url || 'https://not-configured.supabase.co', anonKey || 'not-configured', {
  auth: {
    // The browser keeps the login in localStorage by itself; phones use AsyncStorage.
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Keep the login fresh only while the app is open.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
