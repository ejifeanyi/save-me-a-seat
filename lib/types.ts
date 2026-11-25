export type EventStatus = 'upcoming' | 'live' | 'ended';

export type EventRow = {
  id: string;
  super_admin_id: string;
  name: string;
  venue: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  guest_cap: number;
  invitation_url: string | null;
  status: EventStatus;
  ended_early_at: string | null;
  created_at: string;
};

export type EventWithCounts = EventRow & {
  issued_count: number;
  checked_in_count: number;
};

export type GuestCode = {
  id: string;
  event_id: string;
  code: string;
  label: string | null;
  checked_in_at: string | null;
  created_at: string;
};

export type EventAdmin = {
  event_id: string;
  user_id: string | null;
  invited_email: string;
  invited_by: string | null;
  invite_token: string;
  invited_at: string;
  invite_expires_at: string;
  accepted_at: string | null;
  profile_full_name: string | null;
};

export type CheckinExportRow = {
  label: string | null;
  code: string;
  status: 'admitted' | 'not_admitted';
  checked_in_at: string | null;
  scanned_by_name: string | null;
  is_override: boolean;
};