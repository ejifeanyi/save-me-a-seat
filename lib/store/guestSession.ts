import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { supabase } from '../supabase';

export type RedeemedEvent = {
  eventName: string;
  venue: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  invitationUrl: string | null;
  eventStatus: string;
  guestCodeId: string;
  code: string;
};

type GuestState = {
  initializing: boolean;
  event: RedeemedEvent | null;
  redeem: (code: string) => Promise<{ error: string | null }>;
  clear: () => Promise<void>;
};

const STORAGE_KEY = 'guest_code';

function mapRow(row: any, code: string): RedeemedEvent {
  return {
    eventName: row.event_name,
    venue: row.venue,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    invitationUrl: row.invitation_url,
    eventStatus: row.event_status,
    guestCodeId: row.guest_code_id,
    code,
  };
}

export const useGuestSession = create<GuestState>((set) => ({
  initializing: true,
  event: null,
  redeem: async (rawCode: string) => {
    const code = rawCode.replace(/\s+/g, '').toUpperCase();
    const { data, error } = await supabase.rpc('redeem_guest_code', { p_code: code });
    if (error) return { error: error.message };
    if (!data || data.length === 0) {
      return { error: 'Code not recognized — check with your host and try again' };
    }
    await SecureStore.setItemAsync(STORAGE_KEY, code);
    set({ event: mapRow(data[0], code) });
    return { error: null };
  },
  clear: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    set({ event: null });
  },
}));

export async function restoreGuestSession() {
  const code = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!code) {
    useGuestSession.setState({ initializing: false });
    return;
  }
  const { data, error } = await supabase.rpc('redeem_guest_code', { p_code: code });
  if (error || !data || data.length === 0) {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    useGuestSession.setState({ initializing: false, event: null });
    return;
  }
  useGuestSession.setState({ initializing: false, event: mapRow(data[0], code) });
}