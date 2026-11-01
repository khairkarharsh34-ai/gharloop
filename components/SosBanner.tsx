import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { listActiveSos, resolveSos, subscribeTable } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ago, flatOf } from '@/lib/format';
import { colors, font } from '@/lib/theme';
import { isGuardOrAdmin, type SosAlert } from '@/lib/types';
import { Button } from './Button';
import { Icon } from './Icon';
import { useToast } from './Toast';

/**
 * Red banner on top of every tab while an SOS is active.
 * Guards and admins see everyone's alerts live; residents see their own.
 * Wraps the tabs so the screens below don't add a second status-bar gap.
 */
export function SosBanner({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const responder = isGuardOrAdmin(profile?.role);

  useEffect(() => {
    if (!profile) return;
    const load = () => listActiveSos().then(setAlerts).catch(() => undefined);
    load();
    const stop = subscribeTable('sos_alerts', load);
    const tick = setInterval(load, 60000);
    return () => {
      stop();
      clearInterval(tick);
    };
  }, [profile?.id]);

  const a = alerts[0];
  const mine = a?.user_id === profile?.id;

  async function markSafe() {
    if (!a) return;
    try {
      await resolveSos(a.id);
      setAlerts((l) => l.filter((x) => x.id !== a.id));
      toast('Marked safe');
    } catch (e) {
      toast((e as Error).message);
    }
  }

  // Same tree whether or not an alert shows, so the tabs below never remount.
  return (
    <View style={{ flex: 1 }}>
      {a ? (
        <View style={[s.wrap, { paddingTop: insets.top + 10 }]}>
          <View style={s.row}>
            <Icon name="alert-circle" size={26} color={colors.white} />
            <View style={{ flex: 1 }}>
              <Text style={s.title}>
                {mine && !responder ? 'SOS sent. Help is on the way' : `SOS · ${a.person?.full_name ?? 'Resident'} · ${flatOf(a.person) || 'flat unknown'}`}
              </Text>
              <Text style={s.sub}>
                {ago(a.created_at)}
                {alerts.length > 1 ? ` · +${alerts.length - 1} more active` : ''}
                {mine && !responder ? ' · Security and your admin were alerted' : ''}
              </Text>
            </View>
            {responder ? <Button title="Mark safe" small variant="secondary" onPress={markSafe} /> : null}
          </View>
        </View>
      ) : null}
      <SafeAreaInsetsContext.Provider value={a ? { ...insets, top: 0 } : insets}>{children}</SafeAreaInsetsContext.Provider>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: colors.red, paddingHorizontal: 16, paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { ...font('800'), fontSize: 15, color: colors.white },
  sub: { ...font('500'), fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
});
