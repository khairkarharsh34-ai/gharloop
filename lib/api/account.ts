// Sign up / in / out, password reset, own profile, join requests.
import { Platform } from 'react-native';
import type { JoinRequest, MemberStatus, Profile, Society } from '../types';
import { mustChange, run, supabase } from './client';

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
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** Emails a reset link that opens /reset-password on this site. */
export async function sendPasswordReset(email: string) {
  const redirectTo = Platform.OS === 'web' && typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(error.message);
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export const listSocieties = () =>
  run<Society[]>(supabase.from('societies').select('id, name, city').order('name'));

const PROFILE_COLS = 'id, full_name, society_id, tower, flat, role, status, created_at, society:societies(id, name, city)';

export async function getMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user.id;
  if (!userId) return null;
  const profile = await run<Omit<Profile, 'phone'> | null>(
    supabase.from('profiles').select(PROFILE_COLS).eq('id', userId).maybeSingle(),
  );
  if (!profile) return null;
  // Phone numbers are private: only readable for yourself (needs 002_modules.sql; null until then).
  const { data: phone } = await supabase.rpc('my_phone');
  return { ...profile, phone: (phone as string | null) ?? null };
}

export type ProfilePatch = Partial<Pick<Profile, 'full_name' | 'phone' | 'tower' | 'flat' | 'society_id'>>;

export async function updateMyProfile(id: string, patch: ProfilePatch) {
  await mustChange(supabase.from('profiles').update(patch).eq('id', id).select('id'));
}

export function listJoinRequests(societyId?: string | null) {
  let query = supabase
    .from('profiles')
    .select('id, full_name, tower, flat, created_at, society:societies(name)')
    .eq('status', 'pending')
    .not('society_id', 'is', null)
    .order('created_at');
  if (societyId) query = query.eq('society_id', societyId);
  return run<JoinRequest[]>(query);
}

export async function setMemberStatus(id: string, status: MemberStatus) {
  await mustChange(supabase.from('profiles').update({ status }).eq('id', id).select('id'));
}
