'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, X, ChevronRight, ChevronLeft, Briefcase, FileText } from 'lucide-react';
import { authApi } from '@/services/auth.api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const personalSchema = z.object({
    firstName: z.string().min(1, 'Required').max(50),
    lastName: z.string().min(1, 'Required').max(50),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Required'),
    password: z.string()
        .min(8, 'Min 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Must include uppercase, lowercase, number & special char'),
    confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

const professionalSchema = z.object({
    barRegistration: z.string().min(1, 'Required'),
    specializations: z.string().min(1, 'At least one specialization required'), // UI will handle splitting
    experienceYears: z.coerce.number().min(0, 'Invalid'),
    bio: z.string().max(500, 'Max 500 characters').optional(),
    practiceAreas: z.string().min(1, 'Required'),
    languages: z.string().optional(),
    location: z.string().optional(),
    hourlyRate: z.coerce.number().optional(),
});

type PersonalData = z.infer<typeof personalSchema>;
type ProfessionalData = z.infer<typeof professionalSchema>;

export default function RegisterProfessionalPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [personalData, setPersonalData] = useState<PersonalData | null>(null);

    const personalForm = useForm<PersonalData>({
        resolver: zodResolver(personalSchema),
    });

    const professionalForm = useForm<ProfessionalData>({
        resolver: zodResolver(professionalSchema),
    });

    const onPersonalSubmit = (data: PersonalData) => {
        setPersonalData(data);
        setStep(2);
    };

    const onFinalSubmit = async (data: ProfessionalData) => {
        if (!personalData) return;
        setLoading(true);
        try {
            const { confirm, ...registerPersonalInfo } = personalData;
            await authApi.registerProfessional({
                ...registerPersonalInfo,
                ...data,
                userType: 'advocate',
                specializations: data.specializations.split(',').map(s => s.trim()),
                practiceAreas: data.practiceAreas.split(',').map(s => s.trim()),
                languages: data.languages ? data.languages.split(',').map(s => s.trim()) : [],
            } as any);
            toast.success('Professional registration submitted! Verify your email.');
            router.push(`/verify-email?email=${encodeURIComponent(personalData.email)}&type=advocate`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl animate-fade-in border border-border/20 mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => step === 2 ? setStep(1) : router.push('/register')} className="p-2 rounded-xl border border-border/40 hover:bg-muted transition-colors group">
                    {step === 2 ? <ChevronLeft className="w-4 h-4 text-muted-foreground" /> : <X className="w-4 h-4 text-muted-foreground" />}
                </button>
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight italic uppercase">PROFESSIONAL PARTNERSHIP</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5">
                        Step {step} of 2: {step === 1 ? 'Identity Foundation' : 'Professional Credentials'}
                    </p>
                </div>
            </div>

            {/* Step 1: Personal Details */}
            {step === 1 && (
                <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-5 animate-slide-up">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">First Name</label>
                            <Input {...personalForm.register('firstName')} placeholder="John" className="h-12 rounded-xl" />
                            {personalForm.formState.errors.firstName && <p className="text-destructive text-[10px] px-1 font-bold italic">{personalForm.formState.errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Last Name</label>
                            <Input {...personalForm.register('lastName')} placeholder="Doe" className="h-12 rounded-xl" />
                            {personalForm.formState.errors.lastName && <p className="text-destructive text-[10px] px-1 font-bold italic">{personalForm.formState.errors.lastName.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Professional Email</label>
                        <Input {...personalForm.register('email')} type="email" placeholder="professional@example.com" className="h-12 rounded-xl" />
                        {personalForm.formState.errors.email && <p className="text-destructive text-[10px] px-1 font-bold italic">{personalForm.formState.errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Contact Number</label>
                        <Input {...personalForm.register('phone')} placeholder="+91 98765 43210" className="h-12 rounded-xl" />
                        {personalForm.formState.errors.phone && <p className="text-destructive text-[10px] px-1 font-bold italic">{personalForm.formState.errors.phone.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Security Key</label>
                            <Input {...personalForm.register('password')} type="password" placeholder="********" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Confirm Key</label>
                            <Input {...personalForm.register('confirm')} type="password" placeholder="********" className="h-12 rounded-xl" />
                        </div>
                    </div>
                    <Button type="submit" variant="gradient" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] mt-4">
                        Proceed to Credentials <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                </form>
            )}

            {/* Step 2: Professional Credentials */}
            {step === 2 && (
                <form onSubmit={professionalForm.handleSubmit(onFinalSubmit)} className="space-y-5 animate-slide-up">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Bar Reg. Number</label>
                            <Input {...professionalForm.register('barRegistration')} placeholder="BAR/2024/001" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Exp. Years</label>
                            <Input {...professionalForm.register('experienceYears')} type="number" placeholder="5" className="h-12 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Core Specializations <span className="opacity-50">(comma separated)</span></label>
                        <Input {...professionalForm.register('specializations')} placeholder="Criminal Law, Family Law, Arbitration" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Practice Areas</label>
                        <Input {...professionalForm.register('practiceAreas')} placeholder="Supreme Court, High Court, NCLT" className="h-12 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Primary Languages</label>
                            <Input {...professionalForm.register('languages')} placeholder="English, Hindi, etc." className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Base Location</label>
                            <Input {...professionalForm.register('location')} placeholder="New Delhi, Mumbai" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Hourly Rate (₹)</label>
                            <Input {...professionalForm.register('hourlyRate')} type="number" placeholder="500" className="h-12 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Professional Bio</label>
                        <Textarea {...professionalForm.register('bio')} placeholder="Brief overview of your professional career and notable cases..." className="rounded-xl min-h-[100px] bg-muted/40 border-border/40 focus:bg-background transition-all" />
                        <p className="text-[9px] text-muted-foreground text-right font-medium">Max 500 characters</p>
                    </div>
                    <Button disabled={loading} type="submit" variant="gradient" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] mt-4 shadow-2xl transition-all hover:-translate-y-1">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Validating...</> : 'Submit Application →'}
                    </Button>
                </form>
            )}

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    JusticeLynk Professional verification in progress
                </p>
            </div>
        </div>
    );
}
