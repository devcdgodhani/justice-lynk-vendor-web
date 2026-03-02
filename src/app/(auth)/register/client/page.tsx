'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { authApi } from '@/services/auth.api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
    firstName: z.string().min(1, 'Required').max(50),
    lastName: z.string().min(1, 'Required').max(50),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    password: z.string()
        .min(8, 'Min 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Must include uppercase, lowercase, number & special char'),
    confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

export default function RegisterClientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const { confirm, ...registerData } = data;
            await authApi.registerClient({
                ...registerData,
                userType: 'client',
            });
            toast.success('Registration successful! Please verify your email.');
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-3xl p-10 shadow-2xl animate-fade-in border border-white/10 max-w-xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.push('/register')} className="p-2 rounded-xl border border-border/40 hover:bg-muted transition-colors group">
                    <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight italic uppercase">CLIENT REGISTRATION</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5">Initialize your private secure workspace</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">First Name</label>
                        <Input
                            {...register('firstName')}
                            placeholder="John"
                            className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all font-medium"
                        />
                        {errors.firstName && <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Last Name</label>
                        <Input
                            {...register('lastName')}
                            placeholder="Doe"
                            className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all font-medium"
                        />
                        {errors.lastName && <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.lastName.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Email Identifier</label>
                    <Input
                        {...register('email')}
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all font-medium"
                    />
                    {errors.email && <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Mobile Contact <span className="opacity-50">(opt)</span></label>
                    <Input
                        {...register('phone')}
                        placeholder="+91 98765 43210"
                        className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all font-medium"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border/20 pt-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Security Key</label>
                        <Input
                            {...register('password')}
                            type="password"
                            placeholder="********"
                            className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all font-medium"
                        />
                        {errors.password && <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">Check security rules</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Confirm Key</label>
                        <Input
                            {...register('confirm')}
                            type="password"
                            placeholder="********"
                            className="h-12 rounded-xl bg-muted/40 border-border/40 focus:bg-background transition-all font-medium"
                        />
                        {errors.confirm && <p className="text-destructive text-[10px] mt-1 font-bold uppercase tracking-wider px-1">{errors.confirm.message}</p>}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    variant="gradient"
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 mt-4"
                >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Initializing...</> : 'Open Workspace →'}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Secure 256-bit encrypted registration
                </p>
            </div>
        </div>
    );
}
