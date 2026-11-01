// Need Help: service requests tracked until done.
import type { HelpRequest, HelpStatus } from '../types';
import { mustChange, person, run, supabase } from './client';

export const listHelp = () =>
  run<HelpRequest[]>(
    supabase.from('help_requests').select(`*, ${person('requester', 'help_requests_user_id_fkey')}`).order('created_at', { ascending: false }),
  );

export type NewHelp = { category: string; details: string; preferred: HelpRequest['preferred'] };
export const createHelp = (input: NewHelp) => run(supabase.from('help_requests').insert(input));

export const updateHelp = (id: string, patch: { status?: HelpStatus; assigned_to?: string }) =>
  mustChange(supabase.from('help_requests').update(patch).eq('id', id).select('id'));
