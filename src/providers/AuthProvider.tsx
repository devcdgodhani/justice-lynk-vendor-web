'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { modulesApi } from '@/services/modules.api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setHydrated, accessToken, setUserModules, user } = useAuthStore();

    useEffect(() => {
        setHydrated();
    }, [setHydrated]);

    useEffect(() => {
        const fetchModules = async () => {
            if (accessToken && user) {
                try {
                    const res = await modulesApi.getUserModules();
                    if (res.success) {
                        setUserModules(res.data);
                    }
                } catch (error) {
                    console.error('Failed to fetch user modules:', error);
                }
            }
        };

        fetchModules();
    }, [accessToken, user, setUserModules]);

    return <>{children}</>;
}
