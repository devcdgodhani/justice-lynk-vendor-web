'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/services/auth.api';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
    const router       = useRouter();
    const params       = useSearchParams();
    const redirect     = params.get('redirect') ?? '/dashboard';
    const { setAuth }  = useAuthStore();
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        try {
            const result     = await authApi.login(data);
            const loginData  = result.data;

            // Email not yet verified
            if (loginData.emailVerificationRequired) {
                toast.info('Please verify your email to continue');
                router.push(`/verify-email?email=${encodeURIComponent(loginData.email ?? data.email)}`);
                return;
            }

            // MFA required
            if (loginData.mfaRequired) {
                if (loginData.mfaTempToken) sessionStorage.setItem('jl_mfa_temp', loginData.mfaTempToken);
                router.push('/mfa-verify');
                return;
            }

            if (loginData.user && loginData.accessToken && loginData.refreshToken) {
                setAuth(loginData.user, loginData.accessToken, loginData.refreshToken);
                router.push(redirect);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-2xl p-8 shadow-glass animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                <p className="text-muted-foreground mt-1 text-sm">Sign in to access your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                    <input
                        {...register('email')}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-foreground">Password</label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            {...register('password')}
                            type={showPwd ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd(!showPwd)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 brand-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogIn className="h-4 w-4" /> Sign In</>}
                </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Create one
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
