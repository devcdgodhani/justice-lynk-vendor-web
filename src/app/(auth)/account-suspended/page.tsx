'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Mail, Phone, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';

function AccountSuspendedContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason') || 'Administrative policy violation or security concern.';
    const router = useRouter();
    const { clearAuth } = useAuthStore();

    const handleExitSession = () => {
        clearAuth();
        router.push('/login');
    };

    return (
        <div className="glass rounded-3xl p-12 shadow-2xl animate-fade-in border border-destructive/20 max-w-2xl mx-auto text-center">
            <div className="relative inline-block mb-10">
                <div className="w-24 h-24 rounded-3xl bg-destructive/10 flex items-center justify-center shadow-2xl animate-pulse border border-destructive/20">
                    <ShieldAlert className="w-12 h-12 text-destructive" />
                </div>
            </div>

            <h1 className="text-4xl font-black text-foreground tracking-tight italic uppercase mb-4">ACCOUNT SUSPENDED</h1>
            <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                Your access to the JusticeLynk platform has been temporarily revoked by our compliance team.
            </p>

            <div className="my-10 p-8 rounded-2xl bg-destructive/5 border border-destructive/10 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
                <p className="text-[10px] font-black uppercase tracking-widest text-destructive mb-2">REASON FOR SUSPENSION</p>
                <p className="text-sm font-bold text-foreground leading-relaxed">
                    "{reason}"
                </p>
            </div>

            <div className="space-y-6 max-w-lg mx-auto bg-muted/20 p-8 rounded-2xl border border-border/10">
                <div className="flex items-start gap-4 text-left">
                    <Mail className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-foreground">APPEAL SUBMISSION</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Submit a formal appeal to <span className="text-foreground font-bold">compliance@justicelynk.com</span> with your case reference.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4 text-left">
                    <Phone className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-foreground">IMMEDIATE ASSISTANCE</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Call our support helpline for 24/7 account-related queries.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-border/20">
                <Button
                    variant="outline"
                    onClick={handleExitSession}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-border/40"
                >
                    <LogOut className="w-4 h-4 mr-2" /> Exit Session
                </Button>
                <Button variant="destructive" className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl group">
                    Contact Compliance Desk <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
}

export default function AccountSuspendedPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center font-black uppercase tracking-[0.5em] text-destructive animate-pulse">Retreiving Compliance Status...</div>}>
            <AccountSuspendedContent />
        </Suspense>
    );
}
