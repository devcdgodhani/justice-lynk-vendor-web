'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Zap, Rocket, Crown, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionsApi } from '@/services/subscriptions.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plan } from '@/types';

export default function PlanSelectPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        const fetchPlans = async () => {
            if (!user) return;
            try {
                const res = await subscriptionsApi.getPublicPlans(user.userType);
                setPlans(res.data);
            } catch (err) {
                toast.error('Failed to load subscription plans');
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, [user]);

    const handleSelectPlan = async (planId: string) => {
        setSubmitting(planId);
        try {
            const res = await subscriptionsApi.selectPlan({ planId, billingInterval });

            // Update auth state with new tokens and subscription
            const { setAuth, updateUser } = useAuthStore.getState();
            if (res.data.accessToken && res.data.refreshToken) {
                setAuth(user!, res.data.accessToken, res.data.refreshToken);
            }
            updateUser({ subscription: res.data.subscription });

            toast.success('Plan selected successfully!');

            // Dynamic redirection according to user type
            if (user?.userType === 'law_firm_admin') {
                router.push('/org-select');
            } else if (user?.userType === 'advocate') {
                router.push('/professional');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to select plan');
        } finally {
            setSubmitting(null);
        }
    };

    const handleSkip = () => {
        if (user?.userType === 'law_firm_admin') {
            router.push('/org-select');
        } else if (user?.userType === 'advocate') {
            router.push('/professional');
        } else {
            router.push('/dashboard');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Architecting Selection...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen py-20 px-4 overflow-hidden">
            {/* Background Aesthetic Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto animate-fade-in">
                {/* Header Section */}
                <div className="text-center mb-16 space-y-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="h-px w-8 bg-primary/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Platform Access</span>
                        <span className="h-px w-8 bg-primary/30" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-foreground uppercase italic leading-none">
                        Elevate Your <span className="text-primary not-italic">Justice</span> Workspace
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto leading-relaxed">
                        Precision-engineered plans for <span className="text-foreground font-bold underline decoration-primary/40 underline-offset-4 capitalize">{user?.userType?.replace('_', ' ')}</span> professionals.
                    </p>

                    {/* Billing Toggle (Premium Design) */}
                    <div className="flex flex-col items-center gap-4 pt-4">
                        <div className="inline-flex items-center bg-card/50 backdrop-blur-xl border border-border/40 p-1.5 rounded-2xl shadow-sm">
                            <button
                                onClick={() => setBillingInterval('monthly')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billingInterval === 'monthly' ? 'brand-gradient text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingInterval('yearly')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${billingInterval === 'yearly' ? 'brand-gradient text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Yearly
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-md ${billingInterval === 'yearly' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>-20%</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Plans Grid (Centered handling for 1-3 plans) */}
                <div className={`flex flex-wrap justify-center gap-8 items-stretch`}>
                    {plans.map((plan, idx) => {
                        const isMain = plans.length === 1 || (plans.length > 1 && idx === 1);
                        const icons = [Zap, Rocket, Crown];
                        const Icon = icons[idx % icons.length];

                        return (
                            <div
                                key={plan.id}
                                className={`group relative w-full max-w-[380px] flex flex-col rounded-[2.5rem] transition-all duration-700 hover:-translate-y-3 ${isMain
                                    ? 'glass border-primary/40 shadow-[0_32px_80px_-20px_rgba(var(--primary-rgb),0.15)] z-10'
                                    : 'glass border-border/20 hover:border-primary/20 grayscale-[0.3] hover:grayscale-0'
                                    }`}
                            >
                                {isMain && plans.length > 1 && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 brand-gradient text-white text-[9px] font-black uppercase tracking-[0.3em] px-8 py-2.5 rounded-full shadow-2xl z-20 overflow-hidden">
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                                        Most Popular
                                    </div>
                                )}

                                <div className="p-10 flex flex-col flex-grow">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="space-y-1">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{plan.name}</h3>
                                            <p className="text-2xl font-display font-bold">{idx === 0 ? 'Foundation' : idx === 1 ? 'Accelerator' : 'Elite'}</p>
                                        </div>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${isMain ? 'brand-gradient text-white rotate-3 shadow-xl' : 'bg-primary/5 text-primary border border-primary/10'}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-6xl font-display font-black tracking-tight italic">
                                            {Number(billingInterval === 'monthly'
                                                ? (plan.monthlyOfferPrice || plan.monthlyPrice)
                                                : (plan.yearlyOfferPrice || plan.yearlyPrice)) === 0
                                                ? 'FREE'
                                                : `₹${Number(billingInterval === 'monthly'
                                                    ? (plan.monthlyOfferPrice || plan.monthlyPrice)
                                                    : (plan.yearlyOfferPrice || plan.yearlyPrice)).toLocaleString()}`}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">/{billingInterval === 'monthly' ? 'Month' : 'Year'}</span>
                                            {((billingInterval === 'monthly' && (plan.monthlyDiscount ?? 0) > 0) || (billingInterval === 'yearly' && (plan.yearlyDiscount ?? 0) > 0)) && (
                                                <span className="text-[9px] font-bold text-success capitalize">
                                                    {billingInterval === 'monthly' ? plan.monthlyDiscount : plan.yearlyDiscount}% savings applied
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {(billingInterval === 'monthly' ? plan.monthlyOfferPrice : plan.yearlyOfferPrice) && Number(billingInterval === 'monthly' ? plan.monthlyOfferPrice : plan.yearlyOfferPrice) > 0 && (
                                        <div className="mb-6 flex items-center gap-2">
                                            <span className="text-xs line-through text-muted-foreground font-bold">
                                                ₹{Number(billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString()}
                                            </span>
                                            <Badge className="bg-success/10 text-success border-none text-[8px] font-black tracking-widest uppercase">Special Allocation</Badge>
                                        </div>
                                    )}

                                    <p className="text-[13px] text-muted-foreground font-medium leading-relaxed mb-10 min-h-[40px]">
                                        {plan.description || `Specialized infrastructure for high-performance ${plan.name} operations.`}
                                    </p>

                                    {/* Feature Divider */}
                                    <div className="h-px w-full bg-linear-to-r from-transparent via-border/50 to-transparent mb-10" />

                                    <div className="space-y-5 flex-grow mb-12">
                                        {/* Dynamic Modules mapping */}
                                        {plan.modules?.map((pm, i) => (
                                            <div key={i} className="flex items-center gap-4 transition-all duration-300">
                                                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary shadow-sm">
                                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                                </div>
                                                <span className="text-[11px] font-bold tracking-tight text-foreground/90">{pm.module.name}</span>
                                            </div>
                                        ))}
                                        {/* Capacity Limits mapping */}
                                        {plan.limits?.map((limit, i) => (
                                            <div key={`limit-${i}`} className="flex items-center gap-4 transition-all duration-300">
                                                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary shadow-sm">
                                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                                </div>
                                                <span className="text-[11px] font-bold tracking-tight text-foreground/90">
                                                    {limit.value === -1 ? 'Unlimited' : limit.value} {
                                                        limit.key === 'maxUsers' ? 'Specialized Users' :
                                                            limit.key === 'maxCases' ? 'Active Cases' :
                                                                limit.key === 'storageGb' ? 'GB Secure Storage' :
                                                                    limit.key.replace('max', '')
                                                    }
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => handleSelectPlan(plan.id)}
                                        disabled={!!submitting}
                                        className={`group/btn w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500 overflow-hidden relative ${isMain
                                            ? 'brand-gradient text-white shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_25px_50px_-12px_rgba(var(--primary-rgb),0.4)]'
                                            : 'glass border-border/40 hover:border-primary/40 hover:shadow-xl'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-white/10 translate-y-full transition-transform duration-500 group-hover/btn:translate-y-0" />
                                        <span className="relative flex items-center justify-center gap-2">
                                            {submitting === plan.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    Secure Tier
                                                    <ChevronRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                                                </>
                                            )}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Optional Skip Action */}
                <div className="mt-12 text-center">
                    <button
                        onClick={handleSkip}
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto group"
                    >
                        Skip for Now
                        <div className="w-6 h-px bg-muted-foreground/30 group-hover:w-10 group-hover:bg-primary transition-all duration-500" />
                    </button>
                </div>

                {/* Secure Trust Badge */}
                <div className="mt-24 text-center">
                    <div className="inline-flex items-center flex-col gap-4">
                        <div className="flex items-center gap-6 opacity-30 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-500">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Military-Grade Encryption</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">PCI Compliant</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">24/7 Monitoring</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-[0.2em] max-w-md mx-auto">
                            JusticeLynk utilizes industry-leading security protocols to ensure your data and transactions remain completely sovereign and protected.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}

const ChevronRight = ({ className, ...props }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);
