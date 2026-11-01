// Every database call in the app lives in this file.
import { supabase } from './supabase';
import type { JoinRequest, MemberStatus, Profile, Society } from './types';

type Result = { data: unknown; error: { message: string } | null };

// We have no generated DB types, so each call states the shape it expects.
async function run<T>(query: PromiseLike<Result>): Promise<T> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as T;
}

// ---------- Auth ----------
export type SignUpInput = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  society_id: string;
  tower: string;
  flat: string;
};

/** Returns needsConfirm=true when Supabase wants the user to click an email link first. */
export async function signUp({ email, password, ...details }: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: details } });
  if (error) throw new Error(error.message);
  return { needsConfirm: !data.session };
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// ---------- Societies ----------
export const listSocieties = () =>
  run<Society[]>(supabase.from('societies').select('id, name, city').order('name'));

// ---------- Profiles ----------
export async function getMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user.id;
  if (!userId) return null;
  return run<Profile | null>(
    supabase.from('profiles').select('*, society:societies(id, name, city)').eq('id', userId).maybeSingle(),
  );
}

export type ProfilePatch = Partial<Pick<Profile, 'full_name' | 'phone' | 'tower' | 'flat' | 'society_id'>>;

export async function updateMyProfile(id: string, patch: ProfilePatch) {
  const rows = await run<{ id: string }[]>(supabase.from('profiles').update(patch).eq('id', id).select('id'));
  if (!rows.length) throw new Error('Could not save your details.');
}

// ---------- Join requests (admins) ----------
export function listJoinRequests(societyId?: string | null) {
  let query = supabase
    .from('profiles')
    .select('id, full_name, phone, tower, flat, created_at, society:societies(name)')
    .eq('status', 'pending')
    .not('society_id', 'is', null)
    .order('created_at');
  if (societyId) query = query.eq('society_id', societyId);
  return run<JoinRequest[]>(query);
}

export async function setMemberStatus(id: string, status: MemberStatus) {
  const rows = await run<{ id: string }[]>(supabase.from('profiles').update({ status }).eq('id', id).select('id'));
  if (!rows.length) throw new Error('You do not have permission to do that.');
}
