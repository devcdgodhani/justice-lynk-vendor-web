'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { orgApi } from '@/services/org.api';
import { Building2, Users, Loader2, Mail, ShieldCheck, UserPlus, Globe, MapPin } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function OrganizationPage() {
    const { activeOrg } = useAuthStore();

    const { data: membersRes, isLoading } = useQuery({
        queryKey: ['org-members', activeOrg?.id],
        queryFn: () => orgApi.getMembers(activeOrg!.id),
        enabled: !!activeOrg,
        select: r => r.data,
    });

    const members = membersRes?.items ?? [];

    return (
        <div className="centered-container py-12 max-w-5xl animate-fade-in space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        Administrative Control
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">Organization</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">Oversee your legal entity and team composition.</p>
                </div>
                <Button className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/20 group">
                    <UserPlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Recruit Member
                </Button>
            </div>

            {/* Org Info Flagship Card */}
            {activeOrg && (
                <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-sidebar p-1 text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] -ml-24 -mb-24" />

                    <div className="relative p-10 flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-card flex items-center justify-center text-4xl font-bold text-sidebar shadow-2xl shadow-primary/20 shrink-0">
                            {activeOrg.name.charAt(0)}
                        </div>
                        <div className="space-y-6 flex-1">
                            <div className="space-y-2">
                                <Badge variant="premium" className="rounded-lg bg-primary-foreground/10 border-primary-foreground/10 text-primary-foreground/80 px-3 py-1 text-[10px] tracking-widest font-bold">
                                    CORE ENTITY
                                </Badge>
                                <h2 className="text-4xl font-bold font-display">{activeOrg.name}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3 text-white/60">
                                    <Building2 className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{activeOrg.type || 'Legal Corporation'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/60">
                                    <Globe className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{activeOrg.country || 'Global Jurisdiction'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/60">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Verified Status</span>
                                </div>
                            </div>

                            {activeOrg.description && (
                                <p className="text-sidebar-foreground/60 text-sm font-medium leading-relaxed max-w-2xl italic">
                                    "{activeOrg.description}"
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Members Data Grid */}
            <div className="glass rounded-[2.5rem] border-none shadow-xl overflow-hidden">
                <div className="px-10 py-8 border-b border-border/40 flex items-center justify-between bg-muted/20">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-3">
                            <Users className="h-5 w-5 text-primary" /> Team Composition
                        </h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {membersRes?.meta?.total ?? 0} ACTIVE PERSONNEL IN SYSTEM
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Personnel Data...</p>
                    </div>
                ) : members.length === 0 ? (
                    <div className="py-20 text-center italic text-muted-foreground font-medium">No personnel found in core registry.</div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {members.map((m) => (
                            <div key={m.id} className="group hover:bg-muted/30 transition-all duration-300 px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shadow-inner group-hover:brand-gradient group-hover:text-white transition-all duration-300">
                                        {m.user?.firstName?.charAt(0) ?? '?'}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-foreground group-hover:text-primary transition-colors text-lg font-display">
                                            {m.user?.firstName} {m.user?.lastName}
                                        </p>
                                        <div className="flex items-center gap-2 text-muted-foreground/60">
                                            <Mail className="h-3 w-3" />
                                            <p className="text-xs font-bold tracking-tight">{m.user?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">CLEARANCE</span>
                                        {m.role && (
                                            <Badge variant="secondary" className="rounded-lg px-3 py-1 text-[10px] font-bold border-none bg-muted group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                {m.role.name.toUpperCase()}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1 min-w-[100px]">
                                        <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">SERVICE SINCE</span>
                                        <span className="text-[11px] font-bold text-foreground/60">{formatDate(m.joinedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
