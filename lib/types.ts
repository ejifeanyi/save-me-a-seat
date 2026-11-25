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