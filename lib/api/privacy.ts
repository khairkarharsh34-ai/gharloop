// Privacy rights (DPDP): consent, download my data, delete my account.
import { NOTICE_VERSION } from '../legal';
import { myId, supabase } from './client';

const needsSql = (m: string) => (/function|schema cache/i.test(m) ? 'Run supabase/005_privacy_dpdp.sql first.' : m);

/** Accepted notice version; null = not accepted yet; undefined = unknown (005 not run yet, so don't block anyone). */
export async function getMyConsent(): Promise<string | null | undefined> {
  const { data, error } = await supabase.rpc('my_consent');
  if (error) return undefined;
  return (data as string | null) ?? null;
}

export async function acceptPrivacyNotice() {
  const { error } = await supabase.rpc('accept_privacy_notice', { version: NOTICE_VERSION });
  if (error) throw new Error(needsSql(error.message));
}

export async function exportMyData(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.rpc('export_my_data');
  if (error) throw new Error(needsSql(error.message));
  return data as Record<string, unknown>;
}

/** Removes your photos, then your login and everything linked to it, then signs out. */
export async function deleteMyAccount() {
  const uid = await myId();
  const bucket = supabase.storage.from('photos');
  const { data: files } = await bucket.list(uid, { limit: 1000 });
  if (files?.length) await bucket.remove(files.map((f) => `${uid}/${f.name}`));
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error(needsSql(error.message));
  await supabase.auth.signOut();
}
