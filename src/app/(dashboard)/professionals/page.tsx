'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { professionalsApi } from '@/services/professionals.api';
import { cn } from '@/lib/utils';
import { MapPin, Star, Shield, Search, Loader2, UserCheck, Filter, Award, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TYPES = ['LAWYER', 'ADVOCATE', 'CA', 'CONSULTANT', 'NOTARY'];

const inputCls = 'w-full pl-12 pr-6 py-4 bg-muted/40 border border-border/60 rounded-2xl text-sm font-bold text-foreground placeholder:text-muted-foreground/30 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-card transition-all duration-300';

export default function ProfessionalsPage() {
    const [type, setType] = useState('');
    const [search, setSearch] = useState('');

    const { data: prostRes, isLoading } = useQuery({
        queryKey: ['professionals-marketplace', type, search],
        queryFn: () => professionalsApi.getMarketplace({ type: type || undefined }),
        select: r => r.data,
    });

    const items = prostRes?.items ?? [];

    return (
        <div className="centered-container py-12 max-w-7xl animate-fade-in space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        Expert Network
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">Professionals</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">Engage with verified council for specialized adjudication.</p>
                </div>
            </div>

            {/* Premium Search & Filter Bar */}
            <div className="glass rounded-[2rem] p-4 flex flex-col lg:flex-row gap-4 items-center shadow-xl border-none">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                    <input
                        placeholder="SEARCH COUNSEL BY NOMENCLATURE..."
                        onChange={(e) => setSearch(e.target.value)}
                        className={inputCls}
                    />
                </div>

                <div className="flex gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full pl-12 pr-10 py-4 bg-muted/40 border border-border/60 rounded-2xl text-[10px] font-bold text-foreground uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer transition-all focus:bg-card"
                        >
                            <option value="">DOMAINS: ALL</option>
                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Scanning Global Registry...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="glass rounded-[3rem] py-32 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                        <UserCheck className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold font-display">No Council Detected</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">No professionals match the current search criteria in our verified network.</p>
                    <div className="pt-4">
                        <Button variant="ghost" onClick={() => { setSearch(''); setType(''); }} className="font-bold uppercase tracking-widest text-[10px]">
                            Clear Filters
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((p) => (
                        <Card key={p.id} className="group rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden bg-card/60">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-500">
                                            {p.user?.firstName?.charAt(0) ?? '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg font-display text-foreground group-hover:text-primary transition-colors leading-tight">
                                                {p.user?.firstName} {p.user?.lastName}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-[8px] font-black tracking-tighter bg-primary/5 text-primary border-none">
                                                    {p.type}
                                                </Badge>
                                                {p.isVerified && (
                                                    <Badge variant="premium" className="rounded-md px-1.5 py-0 text-[8px] font-black tracking-tighter flex items-center gap-0.5">
                                                        <Shield className="h-2 w-2" /> VERIFIED
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-secondary">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span className="text-[10px] font-bold">4.9</span>
                                    </div>
                                </div>

                                {p.bio && (
                                    <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium line-clamp-3 italic">
                                        "{p.bio}"
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {p.specializations?.slice(0, 3).map((s) => (
                                        <Badge key={s} variant="outline" className="rounded-xl px-3 py-1 text-[9px] font-bold tracking-widest border-border/60 bg-muted/40 text-muted-foreground uppercase">
                                            {s}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">DEPLOYMENT</span>
                                        <div className="flex items-center gap-1.5 text-foreground/70">
                                            <MapPin className="h-3 w-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{p.city || 'GLOBAL'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">BILLING RATE</span>
                                        <span className="text-sm font-bold text-foreground font-mono">₹{p.hourlyRate || '0'}<span className="text-[10px] text-muted-foreground/40 font-sans ml-1">/HR</span></span>
                                    </div>
                                </div>

                                <Button className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
                                    Request Engagement
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
