// Gate & Visitors: passes with 6-digit codes, guard console, SOS (live).
import type { SosAlert, Visitor, VisitorStatus } from '../types';
import { mustChange, myId, person, run, supabase } from './client';

const VISITOR = `*, ${person('resident', 'visitors_resident_id_fkey')}`;

export async function listMyVisitors() {
  return run<Visitor[]>(
    supabase.from('visitors').select(VISITOR).eq('resident_id', await myId()).order('expected_at', { ascending: false }).limit(30),
  );
}

/** Guard view: everyone expected or inside, nearest first. */
export function listGateVisitors() {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  return run<Visitor[]>(
    supabase.from('visitors').select(VISITOR).in('status', ['expected', 'inside']).gte('expected_at', since).order('expected_at'),
  );
}

export const findVisitorByCode = (code: string) =>
  run<Visitor | null>(supabase.from('visitors').select(VISITOR).eq('code', code).in('status', ['expected', 'inside']).maybeSingle());

export type NewVisitor = { name: string; purpose: Visitor['purpose']; expected_at: string };
export const createVisitor = (input: NewVisitor) => run<Visitor>(supabase.from('visitors').insert(input).select(VISITOR).single());

export const setVisitorStatus = (id: string, status: VisitorStatus) =>
  mustChange(supabase.from('visitors').update({ status }).eq('id', id).select('id'));

export const raiseSos = (note: string) => run(supabase.from('sos_alerts').insert({ note }));

export const listActiveSos = () =>
  run<SosAlert[]>(
    supabase.from('sos_alerts').select(`*, ${person('person', 'sos_alerts_user_id_fkey')}`).eq('status', 'active').order('created_at', { ascending: false }),
  );

export const resolveSos = (id: string) => mustChange(supabase.from('sos_alerts').update({ status: 'resolved' }).eq('id', id).select('id'));

/** Calls onChange whenever a table changes (RLS decides what this user may hear about). */
export function subscribeTable(table: 'sos_alerts' | 'visitors', onChange: () => void) {
  const channel = supabase
    .channel(`${table}:${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => onChange())
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
