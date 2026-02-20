'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Loader2, Briefcase, MoreHorizontal, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCases } from '@/modules/cases/hooks/useCases';
import { cn, formatDate, debounce } from '@/lib/utils';
import { CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '@/constants/permissions';
import { CaseStatus, CaseType } from '@/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const STATUSES: CaseStatus[] = ['OPEN', 'IN_PROGRESS', 'PENDING', 'CLOSED', 'ARCHIVED'];
const TYPES: CaseType[] = ['CIVIL', 'CRIMINAL', 'CORPORATE', 'FAMILY', 'PROPERTY', 'LABOUR', 'OTHER'];

export default function CasesPage() {
    const router = useRouter();
    const { can, isHydrated } = useAuthStore();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');
    const [page, setPage] = useState(1);
    const limit = 15;

    const { data, isLoading, isError } = useCases({ page, limit, status, type, search });

    if (!isHydrated) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Syncing Protocols...</p>
            </div>
        );
    }

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 1;

    const debouncedSearch = useCallback(
        debounce((val: unknown) => { setSearch(val as string); setPage(1); }, 400),
        []
    );

    return (
        <div className="centered-container py-10 space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        Intelligence Portfolio
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">Cases</h1>
                    <p className="text-muted-foreground font-medium">{total} total records in vault</p>
                </div>
                {can('cases.create') && (
                    <Button asChild className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/20">
                        <Link href="/cases/create">
                            <Plus className="mr-2 h-5 w-5" /> New Case Intake
                        </Link>
                    </Button>
                )}
            </div>

            {/* Premium Filter Command Bar */}
            <div className="glass rounded-[2rem] p-6 flex flex-col lg:flex-row gap-4 items-center border-none shadow-2xl shadow-primary/[0.02]">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                    <input
                        placeholder="SEARCH VAULT..."
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="w-full pl-14 pr-6 h-14 bg-muted/40 border border-border/40 rounded-2xl text-sm font-bold text-foreground placeholder:text-muted-foreground/30 placeholder:tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-card transition-all duration-300"
                    />
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="flex-1 lg:w-48 h-14 px-5 bg-muted/40 border border-border/40 rounded-2xl text-xs font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all cursor-pointer appearance-none focus:bg-card"
                    >
                        <option value="">ALL STATUSES</option>
                        {STATUSES.map(s => <option key={s} value={s}>{CASE_STATUS_LABELS[s]}</option>)}
                    </select>
                    <select
                        value={type}
                        onChange={(e) => { setType(e.target.value); setPage(1); }}
                        className="flex-1 lg:w-48 h-14 px-5 bg-muted/40 border border-border/40 rounded-2xl text-xs font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all cursor-pointer appearance-none focus:bg-card"
                    >
                        <option value="">ALL TYPES</option>
                        {TYPES.map(t => <option key={t} value={t}>{CASE_TYPE_LABELS[t]}</option>)}
                    </select>
                </div>
            </div>

            {/* Data Grid */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Accessing Vault Records...</p>
                    </div>
                ) : isError ? (
                    <div className="py-20 text-center glass rounded-[2rem] border-red-500/10">
                        <p className="text-red-500 font-bold uppercase tracking-widest">Access Denied / Connection Failure</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-24 text-center glass rounded-[3rem] border-none shadow-inner bg-muted/20">
                        <Briefcase className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
                        <p className="text-xl font-bold font-display text-foreground">Zero Records Found</p>
                        <p className="text-muted-foreground mt-2 font-medium italic">
                            {search || status || type ? 'No cases match the provided filters.' : 'The vault is currently empty.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4">
                            {items.map((c) => (
                                <Card
                                    key={c.id}
                                    onClick={() => router.push(`/cases/${c.id}`)}
                                    className="group hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-[2rem] border-border/40 shadow-sm overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] font-mono">
                                                    {c.caseNumber}
                                                </span>
                                                <Badge variant="premium" className="text-[9px] py-0 px-2 rounded-md">
                                                    {CASE_TYPE_LABELS[c.type] ?? c.type}
                                                </Badge>
                                            </div>
                                            <h3 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors leading-tight">
                                                {c.title}
                                            </h3>
                                        </div>

                                        <div className="flex items-center md:items-end flex-wrap gap-8">
                                            <div className="flex flex-col md:items-end gap-1">
                                                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Lifecycle</span>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                                                        c.status === 'OPEN' ? 'bg-success text-success/50' :
                                                            c.status === 'IN_PROGRESS' ? 'bg-primary text-primary/50' :
                                                                'bg-muted-foreground/30 text-muted-foreground/30'
                                                    )} />
                                                    <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                                                        {CASE_STATUS_LABELS[c.status]}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:items-end gap-1">
                                                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Entry Date</span>
                                                <span className="text-xs font-bold text-foreground/60">{formatDate(c.createdAt)}</span>
                                            </div>

                                            <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                <ChevronRight className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Premium Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-8 py-8 glass rounded-[2.5rem] mt-10 border-none shadow-xl">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                    PAGE <span className="text-foreground">{page}</span> OF <span className="text-foreground">{totalPages}</span>
                                </p>
                                <div className="flex gap-4">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        Prev
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
