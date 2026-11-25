import { supabase } from './supabase';

export type ScanResultCode =
  | 'admitted'
  | 'already_checked_in'
  | 'not_found'
  | 'not_authorized'
  | 'event_ended'
  | 'not_yet_started';

export type ScanResult = {
  result: ScanResultCode;
  guest_code_id: string | null;
  label: string | null;
  checked_in_at: string | null;
  first_scanned_at: string | null;
  first_scanned_by_name: string | null;
  admitted_count: number | null;
  guest_cap: number | null;
};

export async function scanGuestCode(code: string, override = false): Promise<ScanResult> {
  const { data, error } = await supabase.rpc('scan_guest_code', {
    p_code: code.replace(/\s+/g, '').toUpperCase(),
    p_override: override,
  });
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('No response from scan');
  return data[0] as ScanResult;
}