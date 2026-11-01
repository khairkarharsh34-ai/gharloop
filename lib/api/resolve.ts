// Resolve: issues, owners, deadlines, timeline.
import type { Issue, IssueStatus, IssueUpdate, Priority } from '../types';
import { mustChange, person, run, supabase } from './client';

const ISSUE = `*, ${person('author', 'issues_created_by_fkey')}`;

export function listIssues(filter: 'active' | 'resolved' | 'all' = 'active') {
  let q = supabase.from('issues').select(ISSUE).order('created_at', { ascending: false });
  if (filter === 'active') q = q.neq('status', 'resolved');
  if (filter === 'resolved') q = q.eq('status', 'resolved');
  return run<Issue[]>(q);
}

export const getIssue = (id: string) => run<Issue>(supabase.from('issues').select(ISSUE).eq('id', id).single());

export const listIssueUpdates = (id: string) =>
  run<IssueUpdate[]>(
    supabase.from('issue_updates').select(`id, note, created_at, ${person('author', 'issue_updates_author_id_fkey')}`).eq('issue_id', id).order('created_at'),
  );

export type NewIssue = { title: string; description: string; category: string; priority: Priority; photo_url: string | null };

export const createIssue = (input: NewIssue) =>
  run<{ id: string }>(supabase.from('issues').insert(input).select('id').single());

export type IssuePatch = Partial<{ owner_name: string | null; due_date: string | null; status: IssueStatus; proof_url: string }>;

export async function updateIssue(id: string, patch: IssuePatch) {
  await mustChange(supabase.from('issues').update(patch).eq('id', id).select('id'));
}

export async function addIssueComment(issueId: string, note: string) {
  await run(supabase.from('issue_updates').insert({ issue_id: issueId, note }));
}
