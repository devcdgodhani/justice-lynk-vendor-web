'use client';

import { useQuery } from '@tanstack/react-query';
import {
    Building2, Users, Briefcase, TrendingUp, Plus, ArrowRight,
    Loader2, ShieldAlert, Activity, DollarSign, PieChart, Landmark
} from 'lucide-react';
import { casesApi } from '@/services/cases.api';
import { orgApi } from '@/services/org.api';
import { useAuthStore } from '@/store/auth.store';
import { cn, formatDate } from '@/lib/utils';
import { CASE_STATUS_LABELS } from '@/constants/permissions';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LawFirmDashboardPage() {
    const { user, activeOrg } = useAuthStore();

    const { data: casesRes, isLoading: casesLoading } = useQuery({
        queryKey: ['cases', 'recent', activeOrg?.id],
        queryFn: () => casesApi.getCases({ page: 1, limit: 5 }),
        enabled: !!activeOrg,
    });

    const { data: membersRes, isLoading: membersLoading } = useQuery({
        queryKey: ['org-members', activeOrg?.id],
        queryFn: () => orgApi.getMembers(activeOrg?.id!, 1, 5),
        enabled: !!activeOrg,
    });

    const cases = casesRes?.data?.items ?? [];
    const members = membersRes?.data?.items ?? [];
    const totalCases = casesRes?.data?.meta?.total ?? 0;
    const totalMembers = membersRes?.data?.meta?.total ?? 0;

    const stats = [
        { label: 'Firm Matters', value: totalCases, icon: Landmark, trend: '+15%', color: 'text-primary' },
        { label: 'Active Council', value: totalMembers, icon: Users, trend: 'STABLE', color: 'text-secondary' },
        { label: 'Firm Revenue', value: '₹4.2M', icon: DollarSign, trend: '+22%', color: 'text-success' },
        { label: 'Utilization', value: '88%', icon: PieChart, trend: '+4%', color: 'text-primary' },
    ];

    return (
        <div className="centered-container py-10 space-y-10 animate-fade-in">
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[8px] font-black tracking-widest bg-secondary/5 text-secondary border-secondary/20 uppercase">
                            Executive Authority
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">
                        {activeOrg?.name || 'Firm Adjudication'}
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium italic">
                        Enterprise oversight by <span className="text-foreground font-semibold">{user?.firstName} {user?.lastName}</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 border-border/40">
                        <Link href="/organization">
                            <ShieldAlert className="mr-2 h-3.5 w-3.5 text-secondary" />
                            Firm Governance
                        </Link>
                    </Button>
                    <Button asChild size="lg" className="shadow-lg shadow-primary/20 rounded-xl font-bold uppercase tracking-widest text-[10px] h-12">
                        <Link href="/cases/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Allocate Matter
                        </Link>
                    </Button>
                </div>
            </div>

            {/* High-Performance KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="group hover:border-secondary/30 hover:shadow-md transition-all rounded-[2rem] border-border/40 overflow-hidden bg-card/60">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2.5 rounded-xl bg-muted group-hover:bg-secondary/5 transition-colors")}>
                                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                    stat.trend.startsWith('+') ? "bg-success/10 text-success" :
                                        stat.trend === 'STABLE' ? "bg-secondary/10 text-secondary" : "bg-warning/10 text-warning"
                                )}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-bold font-display mt-1 text-foreground">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Firm Portfolio Section */}
                <Card className="lg:col-span-2 overflow-hidden border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold font-display">Firm Matter Portfolio</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Global oversight of all organizational legalMatters</p>
                        </div>
                        <Button variant="ghost" asChild className="font-bold text-[10px] uppercase tracking-widest text-secondary hover:text-secondary hover:bg-secondary/5">
                            <Link href="/cases">
                                View Full Docket <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="px-0">
                        {casesLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-secondary/40" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cases.map((c) => (
                                    <Card key={c.id} className="rounded-[2rem] border-border/40 hover:border-secondary/30 hover:shadow-lg transition-all duration-300 bg-card/40">
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                                                    <Landmark className="h-6 w-6 text-muted-foreground group-hover:text-secondary transition-colors" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground group-hover:text-secondary transition-colors">{c.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-tighter">{c.caseNumber}</span>
                                                        <span className="text-muted-foreground/20 text-[8px]">•</span>
                                                        <Badge variant="outline" className="px-0 h-auto text-[10px] text-muted-foreground/60 font-medium border-none">
                                                            Lead: {c.assignments?.[0]?.professionalId ? 'Assigned' : 'Unallocated'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <Badge variant={c.status === 'OPEN' ? 'success' : 'secondary'} className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {CASE_STATUS_LABELS[c.status]}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Firm Resources Section */}
                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] border-border/40 bg-card/60">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold font-display">Council Rosters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {membersLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary/40" />
                            ) : members.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic text-center py-4">No council members found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {members.map((m) => (
                                        <div key={m.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                                                    {m.user?.firstName?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground truncate max-w-[120px]">{m.user?.firstName} {m.user?.lastName}</p>
                                                    <p className="text-[10px] text-muted-foreground/60 uppercase font-black">{m.role?.name || 'Member'}</p>
                                                </div>
                                            </div>
                                            <Activity className="h-3.5 w-3.5 text-success animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="h-px bg-border/40 my-2" />
                            <Button variant="ghost" asChild className="w-full text-[10px] font-black uppercase tracking-widest text-secondary">
                                <Link href="/organization">Scale Team</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glass border-none shadow-xl rounded-[2.5rem] overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold font-display group-hover:text-secondary transition-colors">Internal Audit</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/20">
                                <div className="flex items-center gap-2">
                                    <PieChart className="h-4 w-4 text-secondary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Efficiency</span>
                                </div>
                                <span className="text-sm font-mono font-bold text-success">+5.4%</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed italic px-1">
                                High operational throughput detected across all active departments.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import { Landmark as FirmIcon } from 'lucide-react';
