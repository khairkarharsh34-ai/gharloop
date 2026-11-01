// Activities: free (instant) and paid (admin approval + Pay (test)).
import type { Activity, ActivityStatus } from '../types';
import { mustChange, myId, PERSON, run, supabase } from './client';

const ACTIVITY = `*, author:profiles(${PERSON}), activity_joins(user_id)`;

/** Upcoming activities you can see (live ones, plus your own / admin-visible pending ones). */
export function listActivities() {
  const since = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
  return run<Activity[]>(
    supabase.from('activities').select(ACTIVITY).gte('starts_at', since).neq('status', 'cancelled').order('starts_at'),
  );
}

export const getActivity = (id: string) => run<Activity>(supabase.from('activities').select(ACTIVITY).eq('id', id).single());

export type NewActivity = {
  title: string;
  description: string;
  starts_at: string;
  location: string;
  capacity: number | null;
  price: number;
};
export const createActivity = (input: NewActivity) =>
  run<{ id: string; status: ActivityStatus }>(supabase.from('activities').insert(input).select('id, status').single());

export const joinActivity = (id: string) => run(supabase.from('activity_joins').insert({ activity_id: id }));

export async function leaveActivity(id: string) {
  await run(supabase.from('activity_joins').delete().eq('activity_id', id).eq('user_id', await myId()));
}

/** Fake payment: records a test payment row, then joins. No money moves. */
export async function payAndJoin(activity: Pick<Activity, 'id' | 'price'>) {
  await run(supabase.from('payments').insert({ purpose: 'activity', ref_id: activity.id, amount: activity.price }));
  await joinActivity(activity.id);
}

export const setActivityStatus = (id: string, status: ActivityStatus) =>
  mustChange(supabase.from('activities').update({ status }).eq('id', id).select('id'));
