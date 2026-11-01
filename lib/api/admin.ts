// Admin & Super Admin: stats, members, roles, societies.
import type { Role, Society } from '../types';
import { count, mustChange, run, supabase } from './client';

const head = { count: 'exact' as const, head: true };

export async function getAdminStats(societyId: string) {
  const [residents, openIssues, joinRequests, pendingActivities, pendingBusinesses, openHelp] = await Promise.all([
    count(supabase.from('profiles').select('id', head).eq('society_id', societyId).eq('status', 'approved')),
    count(supabase.from('issues').select('id', head).eq('society_id', societyId).neq('status', 'resolved')),
    count(supabase.from('profiles').select('id', head).eq('society_id', societyId).eq('status', 'pending')),
    count(supabase.from('activities').select('id', head).eq('society_id', societyId).eq('status', 'pending')),
    count(supabase.from('businesses').select('id', head).eq('society_id', societyId).eq('status', 'pending')),
    count(supabase.from('help_requests').select('id', head).eq('society_id', societyId).in('status', ['open', 'assigned'])),
  ]);
  return { residents, openIssues, joinRequests, pendingActivities, pendingBusinesses, openHelp };
}

export type Member = { id: string; full_name: string; tower: string | null; flat: string | null; role: Role };

export const listMembers = (societyId: string) =>
  run<Member[]>(
    supabase.from('profiles').select('id, full_name, tower, flat, role').eq('society_id', societyId).eq('status', 'approved').order('full_name'),
  );

export const setMemberRole = (id: string, role: Role) =>
  mustChange(supabase.from('profiles').update({ role }).eq('id', id).select('id'));

export type SocietyRow = Society & { maintenance_amount: number };
export const listAllSocieties = () =>
  run<SocietyRow[]>(supabase.from('societies').select('id, name, city, maintenance_amount').order('name'));

export const createSociety = (name: string, city: string) => run(supabase.from('societies').insert({ name, city }));

export const countSocietyMembers = (societyId: string) =>
  count(supabase.from('profiles').select('id', head).eq('society_id', societyId).eq('status', 'approved'));
