'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Scale, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type UserType = 'client' | 'advocate' | 'law_firm_admin';

export default function RegisterPage() {
    const router = useRouter();
    const [userType, setUserType] = useState<UserType>('client');

    const onContinue = () => {
        const path = userType === 'law_firm_admin' ? 'law-firm' : userType;
        router.push(`/register/${path}`);
    };

    return (
        <div className="glass rounded-3xl p-10 shadow-2xl animate-fade-in border border-white/10 max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-foreground tracking-tight italic">JOIN JUSTICELYNK</h1>
                <p className="text-muted-foreground mt-3 text-sm font-medium tracking-wide">Select your account classification to begin your journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { type: 'client' as UserType, Icon: User, label: 'Client', sub: 'Seeking Legal Support' },
                    { type: 'advocate' as UserType, Icon: Scale, label: 'Professional', sub: 'Solo Professional' },
                    { type: 'law_firm_admin' as UserType, Icon: Building2, label: 'Law Firm', sub: 'Firm / Organisation' },
                ].map(({ type, Icon, label, sub }) => (
                    <button
                        key={type}
                        onClick={() => setUserType(type)}
                        className={`relative flex flex-col items-center gap-5 p-8 rounded-3xl border-2 transition-all duration-500 group ${userType === type
                            ? 'border-primary bg-primary/5 shadow-2xl scale-105'
                            : 'border-border/40 hover:border-primary/40 hover:bg-muted/40'
                            }`}
                    >
                        {userType === type && (
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full brand-gradient flex items-center justify-center shadow-xl animate-bounce">
                                <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${userType === type ? 'brand-gradient shadow-2xl rotate-3' : 'bg-muted group-hover:scale-110'}`}>
                            <Icon className={`w-10 h-10 ${userType === type ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="text-center">
                            <p className={`font-black tracking-tight text-lg ${userType === type ? 'text-primary' : 'text-foreground'}`}>{label}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mt-1.5 opacity-80">{sub}</p>
                        </div>
                    </button>
                ))}
            </div>

            <Button
                onClick={onContinue}
                variant="gradient"
                className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all hover:-translate-y-1.5 active:translate-y-0 group"
            >
                Continue as {labelMap[userType]} <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </Button>

            <div className="mt-10 pt-8 border-t border-border/40 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:text-primary/80 font-black transition-colors underline underline-offset-4 decoration-2">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

const labelMap: Record<UserType, string> = {
    client: 'Client',
    advocate: 'Professional',
    law_firm_admin: 'Law Firm',
};
