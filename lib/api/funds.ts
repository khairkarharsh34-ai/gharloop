// Funds: ledger and maintenance (Pay (test) only records a row).
import type { FundEntry } from '../types';
import { count, myId, mustChange, run, supabase } from './client';

export const listFundEntries = () =>
  run<FundEntry[]>(
    supabase.from('fund_entries').select('id, kind, category, amount, note, entry_date').order('entry_date', { ascending: false }).order('created_at', { ascending: false }),
  );

export type NewFundEntry = Pick<FundEntry, 'kind' | 'category' | 'amount' | 'note' | 'entry_date'>;
export const addFundEntry = (input: NewFundEntry) => run(supabase.from('fund_entries').insert(input));
export const deleteFundEntry = (id: string) => mustChange(supabase.from('fund_entries').delete().eq('id', id).select('id'));

/** This month's maintenance amount and whether you've paid it. */
export async function getMaintenance(societyId: string, period: string) {
  const soc = await run<{ maintenance_amount: number }>(
    supabase.from('societies').select('maintenance_amount').eq('id', societyId).single(),
  );
  const paid = await count(
    supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', await myId())
      .eq('purpose', 'maintenance')
      .eq('period', period),
  );
  return { amount: soc.maintenance_amount, paid: paid > 0 };
}

export const payMaintenance = (amount: number, period: string) =>
  run(supabase.from('payments').insert({ purpose: 'maintenance', amount, period }));
