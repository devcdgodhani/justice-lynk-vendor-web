'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, ShieldAlert, CheckCircle2, Mail, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AccountPendingContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || 'your registered email';

    return (
        <div className="glass rounded-3xl p-12 shadow-2xl animate-fade-in border border-white/10 max-w-2xl mx-auto text-center">
            <div className="relative inline-block mb-10">
                <div className="w-24 h-24 rounded-3xl brand-gradient flex items-center justify-center shadow-2xl animate-pulse">
                    <Clock className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-background border-2 border-primary rounded-full p-2 shadow-lg">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                </div>
            </div>

            <h1 className="text-4xl font-black text-foreground tracking-tight italic uppercase mb-4">APPLICATION UNDER REVIEW</h1>
            <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                Thank you for applying to be a JusticeLynk Partner. Our Administrative team is currently verifying your credentials.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-12 pt-8 border-t border-border/20">
                <div className="p-6 rounded-2xl bg-muted/30 border border-border/20 space-y-3">
                    <CheckCircle2 className="w-6 h-6 text-primary mx-auto opacity-50" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration</p>
                    <p className="text-xs font-bold text-foreground">Complete</p>
                </div>
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 brand-gradient" />
                    <Clock className="w-6 h-6 text-primary mx-auto animate-spin-slow" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Verification</p>
                    <p className="text-xs font-bold text-foreground">In Progress</p>
                </div>
                <div className="p-6 rounded-2xl bg-muted/30 border border-border/20 space-y-3">
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Activation</p>
                    <p className="text-xs font-bold text-muted-foreground italic">Upcoming</p>
                </div>
            </div>

            <div className="space-y-6 max-w-lg mx-auto bg-muted/20 p-8 rounded-2xl border border-border/10">
                <div className="flex items-start gap-4 text-left">
                    <Mail className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-foreground">NEXT STEPS</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            An update will be sent to <span className="text-foreground font-bold">{email}</span> within 24-48 business hours.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4 text-left">
                    <ExternalLink className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-foreground">SUPPORT QUERY</p>
                        <p className="text-sm text-muted-foreground mt-1 text-balance">
                            Need faster activation for an active case? Contact our priority desk.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-border/20">
                <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-border/40">
                        Exit Session
                    </Button>
                </Link>
                <Button variant="gradient" className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl group">
                    Contact Priority Support <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
}

export default function AccountPendingPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Synchronizing Security Status...</div>}>
            <AccountPendingContent />
        </Suspense>
    );
}

// Custom spin animation for CSS
// .animate-spin-slow { animation: spin 4s linear infinite; }
