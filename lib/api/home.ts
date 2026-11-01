// Home "This week" feed: real items from several modules.
import type { Activity, Announcement, Issue } from '../types';
import { PERSON, run, supabase } from './client';

export async function getHomeFeed() {
  const now = new Date().toISOString();
  const [issues, activities, notices] = await Promise.all([
    run<Issue[]>(
      supabase.from('issues').select(`*, author:profiles(${PERSON})`).neq('status', 'resolved').order('created_at', { ascending: false }).limit(2),
    ),
    run<Activity[]>(
      supabase.from('activities').select(`*, author:profiles(${PERSON}), activity_joins(user_id)`).eq('status', 'live').gte('starts_at', now).order('starts_at').limit(2),
    ),
    run<Announcement[]>(
      supabase.from('announcements').select(`*, author:profiles(${PERSON}), rsvps(user_id)`).order('created_at', { ascending: false }).limit(1),
    ),
  ]);
  return { issues, activities, notices };
}
