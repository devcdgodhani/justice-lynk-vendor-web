'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { accessToken, user, activeOrg, isHydrated } = useAuthStore();
    const { sidebarCollapsed } = useUIStore();

    useEffect(() => {
        if (!isHydrated) return;

        if (!accessToken) {
            router.replace('/login');
            return;
        }

        // 1. Approval Status Guards
        if (user?.approvalStatus === 'pending' || user?.approvalStatus === 'rejected') {
            router.replace('/account-pending');
            return;
        }
        if (user?.approvalStatus === 'suspended') {
            router.replace('/account-suspended');
            return;
        }

        // 2. Plan / Subscription Guard - Removed (Locked sidebar modules handle plan enforcement)
        /*
        const isAdmin = user?.userType === 'admin' || user?.userType === 'super_admin';
        if (!user?.subscription && !isAdmin) {
            router.replace('/plan-select');
            return;
        }
        */

        // 3. Organization Select Guard 
        // Only mandatory for law firm admins or if we are in an org-specific route
        if (user?.userType === 'law_firm_admin' && !activeOrg) {
            router.replace('/org-select');
            return;
        }
    }, [accessToken, activeOrg, user, router, isHydrated]);

    if (!isHydrated || !accessToken) return null;

    // Final check before rendering
    const isAdmin = user?.userType === 'admin' || user?.userType === 'super_admin';
    const hasStatusIssue = user?.approvalStatus && user?.approvalStatus !== 'approved';
    const needsOrg = user?.userType === 'law_firm_admin' && !activeOrg;

    if (hasStatusIssue || needsOrg) return null;

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className={cn(
                'flex-1 flex flex-col overflow-hidden transition-all duration-300',
                sidebarCollapsed ? 'ml-16' : 'ml-64',
            )}>
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <div className="max-w-7xl mx-auto page-enter">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
