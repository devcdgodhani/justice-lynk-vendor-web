'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { orgApi } from '@/services/org.api';
import { useAuthStore } from '@/store/auth.store';
import { Organization } from '@/types';
import { toast } from 'sonner';

export default function OrgSelectPage() {
    const router = useRouter();
    const { user, setActiveOrg, accessToken } = useAuthStore();

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
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-start justify-center relative overflow-x-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl opacity-50" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-30" />
            </div>

            <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Logo */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-foreground">JusticeLynk</span>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">Enterprise Legal Platform</p>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-border/20 animate-fade-in">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight italic uppercase">
                            Select Organisation
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1 font-medium">
                            Welcome back, <span className="text-foreground font-bold">{user?.firstName}</span>! Choose your workspace to continue.
                        </p>
                    </div>

                    <div className={`space-y-3 ${orgs.length > 4 ? 'max-h-[50vh] overflow-y-auto pr-1 scrollbar-premium' : ''}`}>
                        {orgs.length === 0 ? (
                            <div className="glass rounded-2xl p-8 text-center">
                                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-foreground font-bold text-sm">No organisations found</p>
                                <p className="text-muted-foreground text-xs mt-1">You haven&apos;t been added to any organisation yet.</p>
                            </div>
                        ) : (
                            orgs.map((org) => (
                                <button
                                    key={org.id}
                                    onClick={() => handleSelect(org)}
                                    className="w-full glass rounded-xl p-4 flex items-center justify-between hover:bg-muted/40 hover:border-primary/30 transition-all duration-200 group text-left border border-border/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg brand-gradient flex items-center justify-center flex-shrink-0 shadow-md">
                                            <span className="text-primary-foreground font-black text-sm">
                                                {(org.name || 'O').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-foreground">{org.name || 'Unnamed Organization'}</div>
                                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{org.type ?? 'Organisation'}</div>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                                </button>
                            ))
                        )}
                    </div>

                    <div className="mt-6 pt-5 border-t border-border/30 flex items-center justify-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary opacity-60" />
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Encrypted Secure Access</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
