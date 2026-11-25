import { create } from 'zustand';
import { supabase } from '../supabase';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  initializing: boolean;
  signUp: (fullName: string, email: string, password: string) => Promise<{ error: string | null }>;
  logIn: (email: string, password: string) => Promise<{ error: string | null }>;
  logOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => {
  supabase.auth.onAuthStateChange((_event, session) => {
    set({ session, initializing: false });
  });

  supabase.auth.getSession().then(({ data }) => {
    set({ session: data.session, initializing: false });
  });

  return {
    session: null,
    initializing: true,
    signUp: async (fullName, email, password) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      return { error: error?.message ?? null };
    },
    logIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    logOut: async () => {
      await supabase.auth.signOut();
    },
  };
});