import { supabase } from './supabase';
import type { EventAdmin } from './types';

export async function listEventAdmins(eventId: string): Promise<EventAdmin[]> {
  const { data, error } = await supabase
    .from('event_admins')
    .select('*, profiles(full_name)')
    .eq('event_id', eventId)
    .order('invited_at', { ascending: true });
  if (error) throw error;
  return (data as any[]).map((row) => ({
    ...row,
    profile_full_name: row.profiles?.full_name ?? null,
  }));
}

export async function inviteEventAdmin(eventId: string, email: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { error } = await supabase.from('event_admins').insert({
    event_id: eventId,
    invited_email: email.trim().toLowerCase(),
    invited_by: user.id,
  });
  if (error) throw error;
}

export async function removeEventAdmin(eventId: string, invitedEmail: string) {
  const { error } = await supabase
    .from('event_admins')
    .delete()
    .eq('event_id', eventId)
    .eq('invited_email', invitedEmail);
  if (error) throw error;
}

// --- Invitee-side (no account yet) ---

export async function getAdminInvite(token: string) {
  const { data, error } = await supabase.rpc('get_admin_invite', { p_token: token.trim() });
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Invite not found');
  return data[0] as {
    event_name: string;
    invited_email: string;
    inviter_name: string | null;
    invite_expires_at: string;
    accepted_at: string | null;
  };
}

export async function acceptAdminInvite(token: string) {
  const { error } = await supabase.rpc('accept_admin_invite', { p_token: token.trim() });
  if (error) throw error;
}