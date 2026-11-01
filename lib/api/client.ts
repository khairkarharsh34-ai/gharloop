// Shared helpers for every API file.
import { supabase } from '../supabase';

export { supabase };

/** Columns shown next to anything a neighbour created ("Priya Nair · A-302"). */
export const PERSON = 'full_name, tower, flat';

/**
 * Attaches the person who created a row, e.g. person('author', 'issues_created_by_fkey').
 * The foreign key is named because some tables reach profiles in two ways
 * (an activity has a host *and* people who joined), and the database must know which one.
 */
export const person = (alias: string, fk: string) => `${alias}:profiles!${fk}(${PERSON})`;

type Result = { data: unknown; error: { message: string } | null };

// We have no generated DB types, so each call states the shape it expects.
export async function run<T>(query: PromiseLike<Result>): Promise<T> {
  const { data, error } = await query;
  if (error) throw new Error(friendly(error.message));
  return data as T;
}

/** Runs an update/delete and fails loudly if no row was changed (usually: no permission). */
export async function mustChange(query: PromiseLike<Result>) {
  const rows = await run<unknown[] | null>(query);
  if (!rows || !rows.length) throw new Error("You don't have permission to do that.");
}

/** Row count without downloading rows. */
export async function count(query: PromiseLike<{ count: number | null; error: { message: string } | null }>) {
  const { count: n, error } = await query;
  if (error) throw new Error(friendly(error.message));
  return n ?? 0;
}

export async function myId() {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Please sign in again.');
  return id;
}

/** Turns raw database errors into sentences people understand. */
function friendly(msg: string) {
  if (msg.includes('row-level security')) return "You don't have permission to do that.";
  if (msg.includes('food_needs_fssai')) return 'Food businesses need a 14-digit FSSAI number.';
  if (msg.includes('duplicate key')) return 'That already exists.';
  if (msg.includes('Failed to fetch') || msg.includes('Network request failed')) return 'No internet connection. Please try again.';
  if (msg.includes('violates check constraint')) return 'Some details are missing or too short.';
  return msg;
}
