import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { ItemCard } from '@/components/ItemCard';
import { MaintenanceCard } from '@/components/MaintenanceCard';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { SpendBreakdown } from '@/components/SpendBreakdown';
import { Stat, StatGrid } from '@/components/Stat';
import { EmptyState, ErrorState, Loading } from '@/components/States';
import { useToast } from '@/components/Toast';
import { Fine } from '@/components/Typography';
import { deleteFundEntry, getMaintenance, listFundEntries } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { rupees, rupeesShort, shortDate } from '@/lib/format';
import { colors, font } from '@/lib/theme';
import { isAdmin } from '@/lib/types';
import { useLoad } from '@/lib/useLoad';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Funds() {
  const { profile } = useAuth();
  const toast = useToast();
  const admin = isAdmin(profile?.role);
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  const { data, error, loading, refreshing, refresh, reload } = useLoad(async () => {
    const [entries, maint] = await Promise.all([
      listFundEntries(),
      profile?.society_id ? getMaintenance(profile.society_id, period) : Promise.resolve(null),
    ]);
    return { entries, maint };
  });

  const entries = data?.entries ?? [];
  const balance = entries.reduce((n, e) => n + (e.kind === 'income' ? e.amount : -e.amount), 0);
  const thisMonth = entries.filter((e) => e.entry_date.startsWith(period) && e.category !== 'Opening balance');
  const collected = thisMonth.filter((e) => e.kind === 'income').reduce((n, e) => n + e.amount, 0);
  const spent = thisMonth.filter((e) => e.kind === 'expense').reduce((n, e) => n + e.amount, 0);
  const byCat = Object.values(
    thisMonth
      .filter((e) => e.kind === 'expense')
      .reduce<Record<string, { category: string; amount: number }>>((m, e) => {
        m[e.category] = { category: e.category, amount: (m[e.category]?.amount ?? 0) + e.amount };
        return m;
      }, {}),
  ).sort((a, b) => b.amount - a.amount);

  async function remove(id: string) {
    try {
      await deleteFundEntry(id);
      toast('Entry deleted');
      reload();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  return (
    <Screen
      back
      title="Maintenance Funds"
      subtitle="Visibility creates accountability — not blame."
      right={admin ? <Button small icon="add" title="Entry" onPress={() => router.push('/funds/new')} /> : undefined}
      onRefresh={refresh}
      refreshing={refreshing}
    >
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <Loading />
      ) : (
        <>
          <StatGrid>
            <Stat value={rupeesShort(balance)} label="Current balance" icon="wallet-outline" tint="green" />
            <Stat value={rupeesShort(collected)} label={`Collected · ${MONTHS[now.getMonth()].slice(0, 3)}`} icon="arrow-down-circle-outline" tint="teal" />
            <Stat value={rupeesShort(spent)} label={`Spent · ${MONTHS[now.getMonth()].slice(0, 3)}`} icon="arrow-up-circle-outline" tint="orange" />
            <Stat value={rupeesShort(collected - spent)} label="Net this month" icon="trending-up-outline" tint={collected >= spent ? 'green' : 'rose'} />
          </StatGrid>

          {data!.maint ? (
            <>
              <Section title="Your dues" />
              <MaintenanceCard amount={data!.maint.amount} paid={data!.maint.paid} period={period} label={monthLabel} onPaid={reload} />
            </>
          ) : null}

          {byCat.length ? (
            <>
              <Section title="Where the money went" />
              <SpendBreakdown items={byCat} />
            </>
          ) : null}

          <Section title="Ledger" />
          {entries.length ? (
            entries.slice(0, 30).map((e) => (
              <ItemCard
                key={e.id}
                icon={e.kind === 'income' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                tint={e.kind === 'income' ? 'green' : 'orange'}
                title={e.category}
                subtitle={e.note ?? undefined}
                meta={shortDate(e.entry_date)}
                right={
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ ...font('800'), fontSize: 15, color: e.kind === 'income' ? colors.green : colors.ink }}>
                      {e.kind === 'income' ? '+' : '−'}
                      {rupees(e.amount)}
                    </Text>
                    {admin ? (
                      <Text onPress={() => remove(e.id)} style={{ ...font('600'), fontSize: 12, color: colors.red, marginTop: 6 }}>
                        Delete
                      </Text>
                    ) : null}
                  </View>
                }
              />
            ))
          ) : (
            <EmptyState icon="wallet-outline" tint="gold" title="No entries yet" text="Your treasurer adds income and expenses here for everyone to see." />
          )}
          <Fine>Figures are entered by your Society Treasurer. Ghar Loop shows these records for transparency but does not audit them.</Fine>
        </>
      )}
    </Screen>
  );
}
