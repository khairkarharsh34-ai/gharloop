// Services & Shops: neighbour-shared contacts and resident businesses.
import type { Business, Contact } from '../types';
import { mustChange, PERSON, run, supabase } from './client';

export const listContacts = () =>
  run<Contact[]>(supabase.from('contacts').select(`*, author:profiles(${PERSON})`).order('created_at', { ascending: false }));

export type NewContact = { name: string; service: string; phone: string; note: string };
export const addContact = (input: NewContact) => run(supabase.from('contacts').insert(input));
export const deleteContact = (id: string) => mustChange(supabase.from('contacts').delete().eq('id', id).select('id'));

export const listBusinesses = () =>
  run<Business[]>(supabase.from('businesses').select(`*, owner:profiles(${PERSON})`).order('created_at', { ascending: false }));

export type NewBusiness = {
  name: string;
  category: string;
  description: string;
  phone: string;
  is_food: boolean;
  fssai: string | null;
};
export const addBusiness = (input: NewBusiness) => run(supabase.from('businesses').insert(input));
export const setBusinessStatus = (id: string, status: Business['status']) =>
  mustChange(supabase.from('businesses').update({ status }).eq('id', id).select('id'));
