import { supabase } from './supabase';
import type { EventRow, EventWithCounts } from './types';

export async function listMyEvents(): Promise<EventWithCounts[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true });

  if (error) throw error;
  if (!events || events.length === 0) return [];

  const eventIds = events.map((e) => e.id);

  const [{ data: issued }, { data: checkIns }] = await Promise.all([
    supabase.from('guest_code_issuance_log').select('event_id').in('event_id', eventIds),
    supabase
      .from('check_ins')
      .select('guest_code_id, guest_codes!inner(event_id)')
      .in('guest_codes.event_id', eventIds),
  ]);

  const issuedCounts = new Map<string, number>();
  for (const row of issued ?? []) {
    issuedCounts.set(row.event_id, (issuedCounts.get(row.event_id) ?? 0) + 1);
  }

  const checkedInCounts = new Map<string, number>();
  for (const row of checkIns ?? []) {
    const eventId = (row as any).guest_codes.event_id;
    checkedInCounts.set(eventId, (checkedInCounts.get(eventId) ?? 0) + 1);
  }

  return (events as EventRow[]).map((e) => ({
    ...e,
    issued_count: issuedCounts.get(e.id) ?? 0,
    checked_in_count: checkedInCounts.get(e.id) ?? 0,
  }));
}

export async function getEvent(id: string): Promise<EventWithCounts> {
  const { data: event, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) throw error;

  const [{ count: issuedCount }, { data: checkIns }] = await Promise.all([
    supabase
      .from('guest_code_issuance_log')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id),
    supabase.from('check_ins').select('guest_code_id, guest_codes!inner(event_id)').eq('guest_codes.event_id', id),
  ]);

  return {
    ...(event as EventRow),
    issued_count: issuedCount ?? 0,
    checked_in_count: checkIns?.length ?? 0,
  };
}

export async function createEvent(input: {
  name: string;
  venue: string;
  startsAt: Date;
  endsAt: Date;
  guestCap: number;
  description?: string;
  invitationUri?: string | null;
}): Promise<EventRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  let invitationUrl: string | null = null;

  if (input.invitationUri) {
    const ext = input.invitationUri.split('.').pop()?.toLowerCase() === 'png' ? 'png' : 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const response = await fetch(input.invitationUri);
    const arrayBuffer = await response.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('invitations')
      .upload(path, arrayBuffer, { contentType: ext === 'png' ? 'image/png' : 'image/jpeg' });
    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage.from('invitations').getPublicUrl(path);
    invitationUrl = publicUrl.publicUrl;
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      super_admin_id: user.id,
      name: input.name,
      venue: input.venue,
      starts_at: input.startsAt.toISOString(),
      ends_at: input.endsAt.toISOString(),
      guest_cap: input.guestCap,
      description: input.description || null,
      invitation_url: invitationUrl,
      status: 'upcoming',
    })
    .select()
    .single();

  if (error) throw error;
  return data as EventRow;
}

export async function endEventEarly(id: string) {
  const { error } = await supabase
    .from('events')
    .update({ status: 'ended', ended_early_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export function formatEventDateTime(iso: string) {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const day = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${weekday}, ${day} ${month} ${year} · ${time}`;
}

export function statusLabel(status: string): 'UPCOMING' | 'LIVE' | 'ENDED' {
  if (status === 'live') return 'LIVE';
  if (status === 'ended') return 'ENDED';
  return 'UPCOMING';
}