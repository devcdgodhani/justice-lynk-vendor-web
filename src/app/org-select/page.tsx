'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Loader2, Building2, ArrowRight } from 'lucide-react';
import { orgApi } from '@/services/org.api';
import { useAuthStore } from '@/store/auth.store';
import { Organization } from '@/types';
import { toast } from 'sonner';

export default function OrgSelectPage() {
    const router = useRouter();
    const { user, setActiveOrg, accessToken, activeOrg } = useAuthStore();

    useEffect(() => {
        if (!accessToken) {
            router.replace('/login');
        }
    }, [accessToken, router]);

    const { data: orgsRes, isLoading } = useQuery({
        queryKey: ['my-orgs'],
        queryFn: orgApi.getMyOrgs,
        enabled: !!accessToken,
    });

    const orgs = orgsRes?.data ?? [];

    const handleSelect = (org: Organization) => {
        setActiveOrg(org);

        // Dynamic redirection after org selection
        const dashboardMap: Record<string, string> = {
            client: '/dashboard',
            advocate: '/professional',
            law_firm_admin: '/law-firm',
        };
        router.push(dashboardMap[user?.userType || 'client'] || '/dashboard');

        toast.success(`Switched to ${org.name}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl opacity-50" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-30" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-foreground">JusticeLynk</span>
                    </div>
                    <h1 className="text-xl font-semibold text-foreground mt-4">
                        Welcome, {user?.firstName}!
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Select an organization to continue
                    </p>
                </div>

                <div className="space-y-3">
                    {orgs.length === 0 ? (
                        <div className="glass rounded-2xl p-8 text-center">
                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-foreground font-medium">No organizations found</p>
                            <p className="text-muted-foreground text-sm mt-1">You haven&apos;t been added to any organization yet.</p>
                        </div>
                    ) : (
                        orgs.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => handleSelect(org)}
                                className="w-full glass rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition-all card-hover group text-left border-none shadow-glass"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg brand-gradient flex items-center justify-center flex-shrink-0 shadow-md">
                                        <span className="text-white font-bold text-sm">
                                            {org.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">{org.name}</div>
                                        <div className="text-xs text-muted-foreground">{org.type ?? 'Organization'}</div>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
