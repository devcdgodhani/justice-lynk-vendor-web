'use client';

import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '@/services/subscriptions.api';
import { billingApi } from '@/services/billing.api';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { CreditCard, CheckCircle2, Loader2, Zap, ShieldCheck, Crown, Activity, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BillingPage() {
    const [subscribing, setSubscribing] = useState<string | null>(null);

    const { data: plansRes } = useQuery({
        queryKey: ['plans'],
        queryFn: subscriptionsApi.getPlans,
        select: r => r.data ?? [],
    });

    const { data: subRes, isLoading } = useQuery({
        queryKey: ['my-subscription'],
        queryFn: subscriptionsApi.getMySubscription,
        select: r => r.data,
    });

    const { data: historyRes } = useQuery({
        queryKey: ['payment-history'],
        queryFn: () => billingApi.getPaymentHistory(),
        select: r => r.data,
    });

    const plans = plansRes ?? [];
    const subscription = subRes;
    const payments = historyRes?.items ?? [];

    const handleSubscribe = async (planId: string) => {
        setSubscribing(planId);
        try {
            const res = await billingApi.createOrder(planId);
            const order = res.data;
            if (!order) { toast.error('Failed to create order'); return; }
            // Open Razorpay
            if (typeof window !== 'undefined' && (window as any).Razorpay) {
                const rzp = new (window as any).Razorpay({
                    key: order.key,
                    amount: order.amount,
                    currency: order.currency,
                    order_id: order.orderId,
                    name: 'JusticeLynk',
                    description: 'Subscription Payment',
                    handler: async (response: any) => {
                        await billingApi.verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        toast.success('Payment successful! Subscription activated.');
                    },
                });
                rzp.open();
            } else {
                toast.error('Razorpay not loaded. Please refresh the page.');
            }
        } catch { toast.error('Failed to initiate payment'); }
        finally { setSubscribing(null); }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Synchronizing Ledger...</p>
            </div>
        );
    }

    return (
        <div className="centered-container py-12 max-w-6xl animate-fade-in space-y-12">
            {/* Header */}
            <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    Financial Protocol
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">Billing & Subscriptions</h1>
                <p className="text-muted-foreground font-medium text-lg italic">Manage your organizational throughput and fiscal audit trail.</p>
            </div>

            {/* Current Status Banner */}
            {subscription ? (
                <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-sidebar p-1 text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                            <div className="w-20 h-20 rounded-[2rem] bg-background flex items-center justify-center text-sidebar shadow-2xl shrink-0">
                                <Crown className="h-10 w-10" />
                            </div>
                            <div className="space-y-4 text-center md:text-left">
                                <div className="space-y-1">
                                    <Badge variant="premium" className="rounded-lg bg-primary-foreground/10 border-primary-foreground/10 text-primary-foreground/80 px-3 py-1 text-[10px] tracking-widest font-bold">
                                        ACTIVE PROTOCOL
                                    </Badge>
                                    <h2 className="text-3xl font-bold font-display">{subscription.plan?.name ?? 'Standard Node'}</h2>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/60">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            Status: <span className="text-success">{subscription.status}</span>
                                        </span>
                                    </div>
                                    {subscription.endDate && (
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                Renews: {formatDate(subscription.endDate)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-center md:text-right space-y-1">
                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">BILLING RATE</p>
                            <p className="text-4xl font-bold font-mono">
                                {subscription.plan ? formatCurrency(subscription.plan.monthlyPrice, 'INR') : '—'}
                            </p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">PER MONTH</p>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="glass rounded-[3rem] p-12 text-center border-none shadow-xl">
                    <Zap className="h-12 w-12 text-primary/40 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold font-display">No Active Subscription</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto italic font-medium">Select a computational plan below to begin secure adjudication.</p>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const isCurrent = subscription?.planId === plan.id;
                    return (
                        <Card key={plan.id} className={cn(
                            "group rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col",
                            isCurrent ? "bg-primary/5 ring-1 ring-primary/20" : "bg-card/60"
                        )}>
                            <CardContent className="p-8 space-y-8 flex-1 flex flex-col">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors">{plan.name}</h3>
                                        {isCurrent && <Badge variant="premium" className="text-[8px] font-black tracking-widest px-2 py-0">CURRENT</Badge>}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold font-mono tracking-tighter text-foreground">{formatCurrency(plan.monthlyPrice, 'INR')}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">/ MONTH</span>
                                    </div>
                                    {plan.description && <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">"{plan.description}"</p>}
                                </div>

                                <div className="space-y-4 flex-1">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">PLATFORM CLEARANCE</p>
                                    <div className="space-y-3">
                                        {plan.limits?.find(l => l.key === 'maxUsers') && (
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                                <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                                                    {plan.limits.find(l => l.key === 'maxUsers')?.value === -1 ? 'Unlimited' : plan.limits.find(l => l.key === 'maxUsers')?.value} Personnel Terminals
                                                </span>
                                            </div>
                                        )}
                                        {plan.limits?.find(l => l.key === 'maxCases') && (
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                                <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                                                    {plan.limits.find(l => l.key === 'maxCases')?.value === -1 ? 'Unlimited' : plan.limits.find(l => l.key === 'maxCases')?.value} Concurrent Case Vaults
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                            <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider">Enterprise Audit Logs</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={subscribing === plan.id || isCurrent}
                                    className={cn(
                                        "w-full h-14 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] transition-all",
                                        isCurrent ? "bg-success/10 text-success hover:bg-success/10 cursor-default" : "shadow-lg shadow-primary/10"
                                    )}
                                >
                                    {subscribing === plan.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isCurrent ? (
                                        'AUTHORIZED'
                                    ) : (
                                        'INITIALIZE ACCESS'
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Payment Audit History */}
            {payments.length > 0 && (
                <div className="glass rounded-[2.5rem] border-none shadow-xl overflow-hidden mt-20">
                    <div className="px-10 py-8 border-b border-border/40 flex items-center justify-between bg-card/40">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-3">
                                <ReceiptText className="h-5 w-5 text-primary" /> Audit Ledger
                            </h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">TRANSACTIONAL CLASSIFIED HISTORY</p>
                        </div>
                    </div>
                    <div className="divide-y divide-border/40">
                        {payments.map((p) => (
                            <div key={p.id} className="group hover:bg-muted/50 transition-all duration-300 px-10 py-6 flex items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground/60 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-foreground font-mono">{formatCurrency(p.amount, p.currency)}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                            {formatDate(p.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="secondary" className={cn(
                                        "rounded-lg px-3 py-1 text-[9px] font-bold border-none",
                                        p.status === 'SUCCESS' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                    )}>
                                        {p.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
