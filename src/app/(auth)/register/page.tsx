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
        <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl animate-fade-in border border-border/20 mx-auto">
            <div className="text-center mb-7 sm:mb-10">
                <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight italic">JOIN JUSTICELYNK</h1>
                <p className="text-muted-foreground mt-2 text-sm font-medium tracking-wide">Select your account classification to begin your journey.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-8 sm:mb-10">
                {[
                    { type: 'client' as UserType, Icon: User, label: 'Client', sub: 'Seeking Legal Support' },
                    { type: 'advocate' as UserType, Icon: Scale, label: 'Professional', sub: 'Solo Professional' },
                    { type: 'law_firm_admin' as UserType, Icon: Building2, label: 'Law Firm', sub: 'Firm / Organisation' },
                ].map(({ type, Icon, label, sub }) => (
                    <button
                        key={type}
                        onClick={() => setUserType(type)}
                        className={`relative flex sm:flex-col flex-row items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 group text-left sm:text-center ${userType === type
                            ? 'border-primary bg-primary/8 shadow-xl ring-2 ring-primary/20'
                            : 'border-border/40 hover:border-primary/40 hover:bg-muted/40'
                            }`}
                    >
                        {userType === type && (
                            <div className="absolute -top-2.5 -right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full brand-gradient flex items-center justify-center shadow-lg">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${userType === type ? 'brand-gradient shadow-xl' : 'bg-muted group-hover:bg-muted/80'}`}>
                            <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${userType === type ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                            <p className={`font-black tracking-tight text-base sm:text-lg ${userType === type ? 'text-primary' : 'text-foreground'}`}>{label}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1 opacity-80">{sub}</p>
                        </div>
                    </button>
                ))}
            </div>

            <Button
                onClick={onContinue}
                variant="gradient"
                className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 group"
            >
                Continue as {labelMap[userType]} <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </Button>

            <div className="mt-7 sm:mt-10 pt-6 sm:pt-8 border-t border-border/40 text-center">
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
