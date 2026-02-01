import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type UserRole = 'coach' | 'athlete' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ error: string | null; role?: UserRole }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set({ isLoading: false });
          return { error: error.message };
        }

        if (data.session) {
          const sbUser = data.session.user;
          // Assume role is stored in app_metadata or user_metadata
          const role = (sbUser.app_metadata?.role || sbUser.user_metadata?.role || 'coach') as UserRole;
          
          const user: User = {
            id: sbUser.id,
            email: sbUser.email!,
            name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
            role,
          };

          set({ 
            user, 
            token: data.session.access_token,
            role, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return { error: null, role };
        }

        set({ isLoading: false });
        return { error: 'No session created' };
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            token: null,
            role: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      checkSession: async () => {
        set({ isLoading: true });
        try {
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            const sbUser = data.session.user;
            const role = (sbUser.app_metadata?.role || sbUser.user_metadata?.role || 'coach') as UserRole;
            
            const user: User = {
              id: sbUser.id,
              email: sbUser.email!,
              name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
              role,
            };

            set({ 
              user, 
              token: data.session.access_token,
              role, 
              isAuthenticated: true 
            });
          } else {
            set({ user: null, token: null, role: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Session check error:', error);
          set({ user: null, token: null, role: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        role: user?.role || get().role,
      }),

      setRole: (role) => set({ role }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'sportan-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

