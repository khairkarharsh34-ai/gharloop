// Society pilots: invite codes, society settings, feedback, pilot health (Super Admin).
import type { Society } from '../types';
import { mustChange, run, supabase } from './client';

const needsSql = (m: string) => (/function|schema cache|column/i.test(m) ? 'Run supabase/006_pilot.sql first.' : m);

/** Finds a society from its 6-letter invite code. Works without logging in. */
export async function societyByCode(code: string): Promise<Society | null> {
  const { data, error } = await supabase.rpc('society_by_code', { code });
  if (error) throw new Error(needsSql(error.message));
  return ((data as Society[]) ?? [])[0] ?? null;
}

/** Invite code for a society (its Society Admin or a Super Admin only). */
export async function getInviteCode(societyId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('society_invite_code', { sid: societyId });
  if (error) throw new Error(needsSql(error.message));
  return (data as string | null) ?? null;
}

export async function setMaintenanceAmount(societyId: string, amount: number) {
  const { error } = await supabase.rpc('set_maintenance_amount', { sid: societyId, amount: Math.round(amount) });
  if (error) throw new Error(needsSql(error.message));
}

export type PilotStats = {
  society_id: string;
  name: string;
  city: string;
  join_code: string;
  is_listed: boolean;
  maintenance_amount: number;
  members: number;
  pending: number;
  admins: number;
  guards: number;
  issues_7d: number;
  notices_7d: number;
  messages_7d: number;
  visitors_7d: number;
  open_issues: number;
  feedback_new: number;
};

export async function getPilotStats(): Promise<PilotStats[]> {
  const { data, error } = await supabase.rpc('pilot_stats');
  if (error) throw new Error(needsSql(error.message));
  return (data as PilotStats[]) ?? [];
}

export const setSocietyListed = (id: string, is_listed: boolean) =>
  mustChange(supabase.from('societies').update({ is_listed }).eq('id', id).select('id'));

// ---------- Feedback ----------
export type FeedbackKind = 'idea' | 'problem' | 'praise';
export type Feedback = {
  id: string;
  kind: FeedbackKind;
  message: string;
  status: 'new' | 'seen' | 'done';
  created_at: string;
  society: { name: string } | null;
  author: { full_name: string; tower: string | null; flat: string | null } | null;
};

export async function sendFeedback(kind: FeedbackKind, message: string, societyId: string | null) {
  const { error } = await supabase.from('feedback').insert({ kind, message: message.trim(), society_id: societyId });
  if (error) throw new Error(needsSql(error.message));
}

export const listFeedback = () =>
  run<Feedback[]>(
    supabase
      .from('feedback')
      .select('id, kind, message, status, created_at, society:societies(name), author:profiles!feedback_user_id_fkey(full_name, tower, flat)')
      .order('created_at', { ascending: false })
      .limit(200),
  );

export const setFeedbackStatus = (id: string, status: Feedback['status']) =>
  mustChange(supabase.from('feedback').update({ status }).eq('id', id).select('id'));

export const getMaintenanceAmount = (societyId: string) =>
  run<{ maintenance_amount: number }>(supabase.from('societies').select('maintenance_amount').eq('id', societyId).single()).then(
    (r) => r.maintenance_amount,
  );
