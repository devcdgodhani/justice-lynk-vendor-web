import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Organization, UserModule } from '@/types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    activeOrg: Organization | null;
    userModules: UserModule[];
    isHydrated: boolean;
    // Actions
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setUserModules: (modules: UserModule[]) => void;
    setActiveOrg: (org: Organization) => void;
    updateUser: (partial: Partial<User>) => void;
    clearAuth: () => void;
    setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            activeOrg: null,
            userModules: [],
            isHydrated: false,

            setAuth: (user, accessToken, refreshToken) => {
                set({ user, accessToken, refreshToken });
                // Set cookie for middleware sync
                if (typeof document !== 'undefined') {
                    document.cookie = `jl-access-token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
                }
            },

            setActiveOrg: (org) => set({ activeOrg: org }),

            setUserModules: (modules) => set({ userModules: modules }),

            updateUser: (partial) =>
                set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),

            clearAuth: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    activeOrg: null,
                    userModules: [],
                });
                // Clear cookie
                if (typeof document !== 'undefined') {
                    document.cookie = 'jl-access-token=; path=/; max-age=0; SameSite=Strict';
                }
            },

            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: 'jl-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                activeOrg: state.activeOrg,
                userModules: state.userModules,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);
