'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, Scale, X } from 'lucide-react';
import { authApi } from '@/services/auth.api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
    firstName: z.string().min(1, 'Required').max(50),
    lastName:  z.string().min(1, 'Required').max(50),
    email:     z.string().email('Invalid email'),
    phone:     z.string().optional(),
    password:  z.string()
        .min(8, 'Min 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Must include uppercase, lowercase, number & special char'),
    confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type FormData = z.infer<typeof schema>;
type UserType = 'client' | 'professional';

export default function RegisterPage() {
    const router  = useRouter();
    const [step, setStep]         = useState<'pick' | 'form'>('pick');
    const [userType, setUserType] = useState<UserType>('client');
    const [loading, setLoading]   = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const res = await authApi.register({
                firstName: data.firstName,
                lastName:  data.lastName,
                email:     data.email,
                phone:     data.phone,
                password:  data.password,
                userType,
            });
            toast.success(res.message || 'Check your email for the verification code!');
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 1: User type picker ──────────────────────────────────────────────
    if (step === 'pick') {
        return (
            <div className="glass rounded-3xl p-10 shadow-2xl animate-fade-in border border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Join JusticeLynk</h1>
                    <p className="text-muted-foreground mt-2 text-sm font-medium">Select your account classification to begin.</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                    {[
                        { type: 'client' as UserType, Icon: User, label: 'Client', sub: 'Seeking legal aid' },
                        { type: 'professional' as UserType, Icon: Scale, label: 'Partner', sub: 'Legal representation' },
                    ].map(({ type, Icon, label, sub }) => (
                        <button
                            key={type}
                            onClick={() => setUserType(type)}
                            className={`relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300 ${
                                userType === type
                                ? 'border-primary bg-primary/5 shadow-inner'
                                : 'border-border/40 hover:border-primary/50 hover:bg-muted/40'
                            }`}
                        >
                            {userType === type && (
                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full brand-gradient flex items-center justify-center shadow-lg">
                                    <svg className="w-3.5 h-3.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${userType === type ? 'brand-gradient shadow-xl' : 'bg-muted'}`}>
                                <Icon className={`w-8 h-8 ${userType === type ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-foreground tracking-tight">{label}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5">{sub}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <Button
                    onClick={() => setStep('form')}
                    variant="gradient"
                    className="w-full h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
                >
                    Continue as {userType === 'client' ? 'Client' : 'Partner'} →
                </Button>

                <div className="mt-8 pt-6 border-t border-border/40 text-center">
                    <p className="text-xs text-muted-foreground font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">Sign in</Link>
                    </p>
                </div>
            </div>
        );
    }

    // ── Step 2: Registration form ─────────────────────────────────────────────
    return (
        <div className="glass rounded-3xl p-10 shadow-2xl animate-fade-in border border-white/10">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setStep('pick')} className="p-2 rounded-xl hover:bg-muted transition-colors border border-border/40">
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Create account</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5">
                        Registering as <span className="font-black underline underline-offset-4">{userType}</span>
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">First Name</label>
                        <Input
                            {...register('firstName')}
                            placeholder="John"
                            className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all"
                        />
                        {errors.firstName && <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Last Name</label>
                        <Input
                            {...register('lastName')}
                            placeholder="Doe"
                            className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all"
                        />
                        {errors.lastName && <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.lastName.message}</p>}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Email Identifier</label>
                    <Input
                        {...register('email')}
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all"
                    />
                    {errors.email && <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Phone <span className="text-[9px] lowercase">(optional)</span></label>
                    <Input
                        {...register('phone')}
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Security Key</label>
                    <Input
                        {...register('password')}
                        type="password"
                        placeholder="Min 8 chars, mixed cases"
                        className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all"
                    />
                    {errors.password && <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Confirm Key</label>
                    <Input
                        {...register('confirm')}
                        type="password"
                        placeholder="Repeat security key"
                        className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all"
                    />
                    {errors.confirm && <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.confirm.message}</p>}
                </div>
                <Button
                    type="submit"
                    disabled={loading}
                    variant="gradient"
                    className="w-full h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 mt-2"
                >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin text-white" /> Initializing…</> : 'Open Workspace →'}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
                <p className="text-xs text-muted-foreground font-medium">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
