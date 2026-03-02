'use client';

import { useQuery } from '@tanstack/react-query';
import { Briefcase, Users, Building2, TrendingUp, Plus, ArrowRight, Loader2, Calendar, MessageSquare, DollarSign } from 'lucide-react';
import { casesApi } from '@/services/cases.api';
import { useAuthStore } from '@/store/auth.store';
import { cn, formatDate } from '@/lib/utils';
import { CASE_STATUS_LABELS } from '@/constants/permissions';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
    const { user, activeOrg } = useAuthStore();

    const { data: casesRes, isLoading } = useQuery({
        queryKey: ['cases', 'recent', activeOrg?.id],
        queryFn: () => casesApi.getCases({ page: 1, limit: 5 }),
        enabled: !!activeOrg,
    });

    const cases = casesRes?.data?.items ?? [];
    const totalCases = casesRes?.data?.meta?.total ?? 0;

    const stats = [
        { label: 'Active Cases', value: totalCases, icon: Briefcase, trend: '+12%', color: 'text-primary' },
        { label: 'Pending Tasks', value: '24', icon: Calendar, trend: '-2', color: 'text-secondary' },
        { label: 'Messages', value: '18', icon: MessageSquare, trend: 'New', color: 'text-primary' },
        { label: 'Revenue', value: '$12.4k', icon: DollarSign, trend: '+8%', color: 'text-success' },
    ];

    return (
        <div className="centered-container py-10 space-y-10 animate-fade-in">
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">
                        Welcome back, {user?.firstName}
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Monitor your legal operations across <span className="text-foreground font-semibold">{activeOrg?.name}</span>.
                    </p>
                </div>
                <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                    <Link href="/cases/create">
                        <Plus className="mr-2 h-5 w-5" />
                        Initiate New Case
                    </Link>
                </Button>
            </div>

            {/* Premium KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="group hover:border-primary/30 hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2.5 rounded-xl bg-muted group-hover:bg-primary/5 transition-colors")}>
                                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                    stat.trend.startsWith('+') ? "bg-success/10 text-success" :
                                        stat.trend === 'New' ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                                )}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-bold font-display mt-1 text-foreground">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Cases Section */}
                <Card className="lg:col-span-2 overflow-hidden border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold font-display">Recent Case Activity</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Lates updates from your active legal matters</p>
                        </div>
                        <Button variant="ghost" asChild className="font-semibold text-primary hover:text-primary hover:bg-primary/5">
                            <Link href="/cases">
                                View Portfolio <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="px-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                            </div>
                        ) : cases.length === 0 ? (
                            <div className="py-20 text-center bg-card border border-dashed border-border rounded-3xl">
                                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">No active cases found</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mt-2">Start by creating a new case or assigning yourself to an existing one.</p>
                                <Button variant="outline" className="mt-6 rounded-xl" asChild>
                                    <Link href="/cases/create">Create Case</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cases.map((c) => (
                                    <Link key={c.id} href={`/cases/${c.id}`} className="block group">
                                        <Card className="hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                            <CardContent className="p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                        <Scale className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{c.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-tighter">{c.caseNumber}</span>
                                                            <span className="text-muted-foreground/30">•</span>
                                                            <span className="text-xs font-medium text-muted-foreground">{formatDate(c.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <Badge variant={c.status === 'OPEN' ? 'success' : c.status === 'CLOSED' ? 'secondary' : 'info'} className="px-3 py-1 rounded-lg">
                                                        {CASE_STATUS_LABELS[c.status]}
                                                    </Badge>
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
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

                {/* Sidebar/Activity Section */}
                <div className="space-y-8">
                    <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <CardHeader>
                            <CardTitle className="text-lg">Premium Membership</CardTitle>
                            <p className="text-primary-foreground/70 text-sm">You are on the <span className="text-primary-foreground font-bold">Enterprise Plan</span>. Enjoy unlimited access to all features.</p>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 text-primary-foreground rounded-xl">
                                Manage Subscription
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-muted flex flex-col items-center justify-center group-hover:bg-primary/5 transition-colors">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Feb</span>
                                        <span className="text-lg font-bold text-foreground">2{i}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Client Consultation</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">10:00 AM · Meeting Room A</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs font-bold text-primary mt-2">
                                View Calendar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Just in case Scale is not imported
import { Scale } from 'lucide-react';
