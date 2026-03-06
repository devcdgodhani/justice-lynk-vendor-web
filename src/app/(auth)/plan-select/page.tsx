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

            const { setAuth, updateUser } = useAuthStore.getState();
            if (res.data.accessToken && res.data.refreshToken) {
                setAuth(user!, res.data.accessToken, res.data.refreshToken);
            }
            updateUser({ subscription: res.data.subscription });

            toast.success('Plan selected successfully!');

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
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Loading Plans...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-12 space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <span className="h-px w-8 bg-primary/30" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Platform Access</span>
                    <span className="h-px w-8 bg-primary/30" />
                </div>
                <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-foreground uppercase italic leading-none">
                    Elevate Your <span className="text-primary not-italic">Justice</span> Workspace
                </h1>
                <p className="text-muted-foreground font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                    Precision-engineered plans for{' '}
                    <span className="text-foreground font-bold underline decoration-primary/40 underline-offset-4 capitalize">
                        {user?.userType?.replace('_', ' ')}
                    </span>{' '}
                    professionals.
                </p>

                {/* Billing Toggle */}
                <div className="flex flex-col items-center pt-2">
                    <div className="inline-flex items-center bg-card/50 backdrop-blur-xl border border-border/40 p-1 rounded-xl shadow-sm">
                        <button
                            onClick={() => setBillingInterval('monthly')}
                            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${billingInterval === 'monthly' ? 'brand-gradient text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingInterval('yearly')}
                            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${billingInterval === 'yearly' ? 'brand-gradient text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Yearly
                            <span className={`text-[8px] px-1.5 py-0.5 rounded ${billingInterval === 'yearly' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'}`}>-20%</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Plans Grid — 1 col mobile, 2 col tablet, 3 col desktop */}
            <div className={`grid gap-5 sm:gap-6 items-stretch ${plans.length === 1
                    ? 'grid-cols-1 max-w-sm mx-auto'
                    : plans.length === 2
                        ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                {plans.map((plan, idx) => {
                    const isMain = plans.length === 1 || (plans.length > 1 && idx === 1);
                    const icons = [Zap, Rocket, Crown];
                    const Icon = icons[idx % icons.length];

                    return (
                        <div
                            key={plan.id}
                            className={`group relative flex flex-col rounded-2xl sm:rounded-[2rem] transition-all duration-500 hover:-translate-y-2 ${isMain
                                ? 'glass border-primary/40 shadow-2xl z-10 ring-1 ring-primary/20'
                                : 'glass border-border/20 hover:border-primary/20'
                                }`}
                        >
                            {isMain && plans.length > 1 && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 brand-gradient text-primary-foreground text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-xl z-20 overflow-hidden whitespace-nowrap">
                                    <div className="absolute inset-0 bg-primary-foreground/10 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                                    Most Popular
                                </div>
                            )}

                            <div className="p-6 sm:p-8 flex flex-col flex-grow">
                                {/* Plan header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{plan.name}</h3>
                                        <p className="text-xl sm:text-2xl font-display font-bold text-foreground">
                                            {idx === 0 ? 'Foundation' : idx === 1 ? 'Accelerator' : 'Elite'}
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${isMain ? 'brand-gradient text-primary-foreground shadow-lg rotate-3' : 'bg-primary/5 text-primary border border-primary/10'}`}>
                                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl sm:text-5xl font-display font-black tracking-tight italic text-foreground">
                                        {Number(billingInterval === 'monthly'
                                            ? (plan.monthlyOfferPrice || plan.monthlyPrice)
                                            : (plan.yearlyOfferPrice || plan.yearlyPrice)) === 0
                                            ? 'FREE'
                                            : `₹${Number(billingInterval === 'monthly'
                                                ? (plan.monthlyOfferPrice || plan.monthlyPrice)
                                                : (plan.yearlyOfferPrice || plan.yearlyPrice)).toLocaleString()}`}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">/{billingInterval === 'monthly' ? 'mo' : 'yr'}</span>
                                        {((billingInterval === 'monthly' && (plan.monthlyDiscount ?? 0) > 0) || (billingInterval === 'yearly' && (plan.yearlyDiscount ?? 0) > 0)) && (
                                            <span className="text-[9px] font-bold text-success capitalize">
                                                {billingInterval === 'monthly' ? plan.monthlyDiscount : plan.yearlyDiscount}% off
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {(billingInterval === 'monthly' ? plan.monthlyOfferPrice : plan.yearlyOfferPrice) &&
                                    Number(billingInterval === 'monthly' ? plan.monthlyOfferPrice : plan.yearlyOfferPrice) > 0 && (
                                        <div className="mb-4 flex items-center gap-2">
                                            <span className="text-xs line-through text-muted-foreground font-bold">
                                                ₹{Number(billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString()}
                                            </span>
                                        <Badge className="bg-success/10 text-success border-none text-[8px] font-black tracking-widest uppercase">Special Offer</Badge>
                                        </div>
                                    )}

                                <p className="text-xs sm:text-[13px] text-muted-foreground font-medium leading-relaxed mb-6 min-h-[36px]">
                                    {plan.description || `Specialized infrastructure for high-performance ${plan.name} operations.`}
                                </p>

                                <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent mb-6" />

                                {/* Features */}
                                <div className="space-y-3 flex-grow mb-8">
                                    {plan.modules?.map((pm, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            </div>
                                            <span className="text-[11px] font-bold tracking-tight text-foreground/90">{pm.module.name}</span>
                                        </div>
                                    ))}
                                    {plan.limits?.map((limit, i) => (
                                        <div key={`limit-${i}`} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            </div>
                                            <span className="text-[11px] font-bold tracking-tight text-foreground/90">
                                                {limit.value === -1 ? 'Unlimited' : limit.value}{' '}
                                                {limit.key === 'maxUsers' ? 'Users' :
                                                    limit.key === 'maxCases' ? 'Active Cases' :
                                                        limit.key === 'storageGb' ? 'GB Storage' :
                                                            limit.key.replace('max', '')}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={!!submitting}
                                    className={`group/btn w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 relative overflow-hidden ${isMain
                                        ? 'brand-gradient text-primary-foreground shadow-lg hover:shadow-xl hover:opacity-95'
                                        : 'glass border-border/40 hover:border-primary/40 hover:shadow-lg text-foreground'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-primary-foreground/10 translate-y-full transition-transform duration-300 group-hover/btn:translate-y-0" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {submitting === plan.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                Select Plan
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

            {/* Skip Action */}
            <div className="mt-8 sm:mt-10 text-center">
                <button
                    onClick={handleSkip}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto group"
                >
                    Skip for Now
                    <div className="w-6 h-px bg-muted-foreground/30 group-hover:w-10 group-hover:bg-primary transition-all duration-500" />
                </button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 sm:mt-16 text-center">
                <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-40 hover:opacity-70 transition-all duration-500">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Military-Grade Encryption</span>
                    <div className="w-1 h-1 rounded-full bg-primary hidden sm:block" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">PCI Compliant</span>
                    <div className="w-1 h-1 rounded-full bg-primary hidden sm:block" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">24/7 Monitoring</span>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
