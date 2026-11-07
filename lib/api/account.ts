// Sign up / in / out, password reset, own profile, join requests.
import { Platform } from 'react-native';
import type { JoinRequest, MemberStatus, Profile, Society } from '../types';
import { cleanMobile, mobileLogin } from '../phone';
import { mustChange, run, supabase } from './client';

export type SignUpInput = {
  /** An email address, or a 10-digit mobile number for mobile login. */
  login: string;
  password: string;
  full_name: string;
  phone: string;
  society_id: string;
  tower: string;
  flat: string;
};

/** Returns needsConfirm=true when Supabase wants the user to click an email link first. */
export async function signUp({ login, password, ...details }: SignUpInput) {
  const mobile = login.includes('@') ? null : cleanMobile(login);
  if (!login.includes('@') && !mobile) throw new Error('Enter a valid 10-digit mobile number.');
  const email = mobile ? mobileLogin(mobile) : login;
  const data_ = mobile ? { ...details, phone: `+91${mobile}` } : details;
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: data_ } });
  if (error) {
    if (/already registered|already exists/i.test(error.message))
      throw new Error(mobile ? 'This mobile number already has an account. Sign in instead.' : 'This email already has an account. Sign in instead.');
    throw new Error(error.message);
  }
  return { needsConfirm: !data.session };
}

/** Signs in with an email address or a mobile number. */
export async function signIn(login: string, password: string) {
  const mobile = login.includes('@') ? null : cleanMobile(login);
  if (!login.includes('@') && !mobile) throw new Error('Enter a valid 10-digit mobile number.');
  const { error } = await supabase.auth.signInWithPassword({ email: mobile ? mobileLogin(mobile) : login, password });
  if (error)
    throw new Error(
      error.message === 'Invalid login credentials' ? (mobile ? 'Wrong mobile number or password.' : 'Wrong email or password.') : error.message,
    );
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

/** Admins: give a member a new temporary password (for mobile accounts that can't use email reset). */
export async function setTemporaryPassword(userId: string) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const temp = 'Ghar' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const { error } = await supabase.rpc('reset_member_password', { target: userId, new_password: temp });
  if (error) throw new Error(/function|schema cache/i.test(error.message) ? 'Run supabase/004_mobile_login.sql first.' : error.message);
  return temp;
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
