import { supabase } from './supabase';
import type { CheckinExportRow, GuestCode } from './types';

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

export async function exportCheckins(eventId: string): Promise<CheckinExportRow[]> {
  const { data, error } = await supabase.rpc('export_checkins', { p_event_id: eventId });
  if (error) throw error;
  return data as CheckinExportRow[];
}

export function toCsv(rows: CheckinExportRow[]): string {
  const header = ['Label', 'Code', 'Status', 'Checked In At', 'Scanned By', 'Override'];
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = rows.map((r) =>
    [
      r.label ?? '',
      r.code,
      r.status === 'admitted' ? 'Admitted' : 'Not Admitted',
      r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : '',
      r.scanned_by_name ?? '',
      r.is_override ? 'Yes' : 'No',
    ]
      .map((v) => escape(String(v)))
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}