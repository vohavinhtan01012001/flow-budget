import store2 from 'store2';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/shared.const';
import { supabase } from '@/libs/supabase/client';

interface IState {
  accessToken: null | string;
  clearSession: () => void;
  initialize: () => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
  setToken: (token: string) => void;
  setUser: (data: ISupabaseUser) => void;
  userInfo?: ISupabaseUser;
}

interface ISupabaseUser {
  email: string;
  id: string;
}

export const useAuthStore = create<IState>()(
  devtools((set, get) => ({
    accessToken: store2.get(STORAGE_KEYS.ACCESS_TOKEN),

    // Local-only session cleanup (no network call)
    clearSession: () => {
      set({
        accessToken: null,
        isAuthenticated: false,
        userInfo: undefined,
      });
      store2.remove(STORAGE_KEYS.ACCESS_TOKEN);
    },

    initialize: async () => {
      if (get().isAuthenticated) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          get().setToken(session.access_token);
          get().setUser({
            email: session.user.email ?? '',
            id: session.user.id,
          });
        }
      } catch (error) {
        console.error(error);
      }
    },

    isAuthenticated: false,

    login: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        get().setToken(data.session.access_token);
        get().setUser({
          email: data.user.email ?? '',
          id: data.user.id,
        });
      }
    },

    loginWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        options: {
          redirectTo: window.location.origin,
        },
        provider: 'google',
      });

      if (error) throw error;
    },

    logout: () => {
      // Clear local state immediately (instant UI response)
      get().clearSession();
      // Fire signOut in background — don't await
      supabase.auth.signOut().catch(() => {});
    },

    register: async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
    },

    setToken: (token: string) => {
      store2.set(STORAGE_KEYS.ACCESS_TOKEN, token);
      set({ accessToken: token });
    },

    setUser: (data: ISupabaseUser) =>
      set({ isAuthenticated: true, userInfo: data }),

    userInfo: undefined,
  })),
);
