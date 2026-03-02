'use client';

import { useQuery } from '@tanstack/react-query';
import {
    Briefcase, Users, Scale, TrendingUp, Plus, ArrowRight,
    Loader2, Calendar, MessageSquare, DollarSign, Award, ShieldCheck
} from 'lucide-react';
import { casesApi } from '@/services/cases.api';
import { useAuthStore } from '@/store/auth.store';
import { cn, formatDate } from '@/lib/utils';
import { CASE_STATUS_LABELS } from '@/constants/permissions';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProfessionalDashboardPage() {
    const { user, activeOrg } = useAuthStore();

    const { data: casesRes, isLoading } = useQuery({
        queryKey: ['cases', 'recent', activeOrg?.id],
        queryFn: () => casesApi.getCases({ page: 1, limit: 5 }),
        enabled: !!activeOrg,
    });

    const cases = casesRes?.data?.items ?? [];
    const totalCases = casesRes?.data?.meta?.total ?? 0;

    const stats = [
        { label: 'Active Matters', value: totalCases, icon: Scale, trend: '+12%', color: 'text-primary' },
        { label: 'Billable Hours', value: '142', icon: TrendingUp, trend: '+8%', color: 'text-success' },
        { label: 'Client Messages', value: '12', icon: MessageSquare, trend: 'New', color: 'text-primary' },
        { label: 'Pending Filings', value: '5', icon: Briefcase, trend: 'Urgent', color: 'text-warning' },
    ];

    return (
        <div className="centered-container py-10 space-y-10 animate-fade-in">
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[8px] font-black tracking-widest bg-primary/5 text-primary border-primary/20 uppercase">
                            Professional Access
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">
                        Counsel Control: {user?.firstName}
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium italic">
                        Overseeing legal operations for <span className="text-foreground font-semibold">{activeOrg?.name || 'Your Practice'}</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild size="lg" className="shadow-lg shadow-primary/20 rounded-2xl">
                        <Link href="/cases/create">
                            <Plus className="mr-2 h-5 w-5" />
                            Open New Matter
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Premium KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="group hover:border-primary/30 hover:shadow-md transition-all rounded-[2rem] border-border/40 overflow-hidden bg-card/60">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2.5 rounded-xl bg-muted group-hover:bg-primary/5 transition-colors")}>
                                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                    stat.trend.startsWith('+') ? "bg-success/10 text-success" :
                                        stat.trend === 'New' ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
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
                {/* Recent Matters Section */}
                <Card className="lg:col-span-2 overflow-hidden border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold font-display">Active Legal Matters</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Real-time status of your judicial engagements</p>
                        </div>
                        <Button variant="ghost" asChild className="font-bold text-[10px] uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5">
                            <Link href="/cases">
                                View Case Vault <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="px-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                            </div>
                        ) : cases.length === 0 ? (
                            <div className="py-20 text-center glass rounded-[3rem] border-border/20">
                                <div className="w-16 h-16 bg-muted rounded-2x flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">No active matters detected</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mt-2">The judicial docket is currently clear. Initialize a new matter to begin.</p>
                                <Button className="mt-6 rounded-xl font-bold uppercase tracking-widest text-[10px]" asChild>
                                    <Link href="/cases/create">Initiate Matter</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cases.map((c) => (
                                    <Link key={c.id} href={`/cases/${c.id}`} className="block group">
                                        <Card className="rounded-[2rem] border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-card/40">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                        <Scale className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{c.title}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-tighter">{c.caseNumber}</span>
                                                            <span className="text-muted-foreground/20 text-[8px]">•</span>
                                                            <span className="text-xs font-medium text-muted-foreground/60">{formatDate(c.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <Badge variant={c.status === 'OPEN' ? 'success' : c.status === 'CLOSED' ? 'secondary' : 'info'} className="px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                                                        {CASE_STATUS_LABELS[c.status]}
                                                    </Badge>
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                        <ArrowRight className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar/Professional Insights Section */}
                <div className="space-y-8">
                    <Card className="brand-gradient text-white border-none shadow-xl shadow-primary/20 overflow-hidden relative rounded-[2.5rem]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Elite Status</span>
                            </div>
                            <CardTitle className="text-xl">Pro Professional</CardTitle>
                            <p className="text-white/70 text-sm leading-relaxed">
                                You are operating with <span className="font-bold">Enterprise Adjudication</span> capabilities.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] h-12">
                                Governance Details
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-border/40 bg-card/60">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold font-display">Adjudication Calendar</CardTitle>
                            <Calendar className="h-5 w-5 text-muted-foreground/30" />
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer items-center">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-muted flex flex-col items-center justify-center group-hover:bg-primary/5 transition-colors border border-border/20">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">FEB</span>
                                        <span className="text-lg font-bold text-foreground">2{i}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">Motion for Summary Judgment</p>
                                        <p className="text-[10px] font-medium text-muted-foreground/60 mt-0.5 uppercase tracking-wide">Courtroom 4B · 09:30 AM</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-primary mt-2">
                                Expand Docket
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import { Crown } from 'lucide-react';
