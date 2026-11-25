import { supabase } from './supabase';
import type { GuestCode } from './types';

export async function listGuestCodes(eventId: string): Promise<GuestCode[]> {
  const { data, error } = await supabase
    .from('guest_codes')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as GuestCode[];
}

export async function generateGuestCodes(eventId: string, count: number, label?: string) {
  const { data, error } = await supabase.rpc('generate_guest_codes', {
    p_event_id: eventId,
    p_count: count,
    p_label: label || null,
  });
  if (error) throw error;
  return data as GuestCode[];
}

export function formatCode(code: string) {
  // 12 chars -> "ABCD EFGH IJKL" for readability, matches the Figma display format
  return code.match(/.{1,4}/g)?.join(' ') ?? code;
}