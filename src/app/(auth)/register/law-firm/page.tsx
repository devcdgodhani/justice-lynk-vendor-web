'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, X, ChevronRight, ChevronLeft, Building2, ShieldCheck } from 'lucide-react';
import { authApi } from '@/services/auth.api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const adminSchema = z.object({
    firstName: z.string().min(1, 'Required').max(50),
    lastName: z.string().min(1, 'Required').max(50),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Required'),
    password: z.string()
        .min(8, 'Min 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Must include uppercase, lowercase, number & special char'),
    confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

const firmSchema = z.object({
    firmName: z.string().min(2, 'Min 2 characters'),
    registrationNumber: z.string().min(1, 'Required'),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    specializations: z.string().min(1, 'Required'),
    address: z.string().min(5, 'Address too short'),
    establishedYear: z.coerce.number().min(1800, 'Invalid year').optional(),
    description: z.string().max(500, 'Max 500 characters').optional(),
    firmEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    firmPhone: z.string().optional(),
});

type AdminData = z.infer<typeof adminSchema>;
type FirmData = z.infer<typeof firmSchema>;

export default function RegisterLawFirmPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [adminData, setAdminData] = useState<AdminData | null>(null);

    const adminForm = useForm<AdminData>({
        resolver: zodResolver(adminSchema),
    });

    const firmForm = useForm<FirmData>({
        resolver: zodResolver(firmSchema),
    });

    const onAdminSubmit = (data: AdminData) => {
        setAdminData(data);
        setStep(2);
    };

    const onFinalSubmit = async (data: FirmData) => {
        if (!adminData) return;
        setLoading(true);
        try {
            const { confirm, ...registerAdminInfo } = adminData;
            await authApi.registerLawFirm({
                ...registerAdminInfo,
                ...data,
                userType: 'law_firm_admin',
                specializations: data.specializations.split(',').map(s => s.trim()),
                address: { full: data.address }, // Wrap string in object for Json field
            } as any);
            toast.success('Firm registration submitted! Verify your email.');
            router.push(`/verify-email?email=${encodeURIComponent(adminData.email)}&type=law_firm`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-3xl p-10 shadow-2xl animate-fade-in border border-white/10 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => step === 2 ? setStep(1) : router.push('/register')} className="p-2 rounded-xl border border-border/40 hover:bg-muted transition-colors group">
                    {step === 2 ? <ChevronLeft className="w-4 h-4 text-muted-foreground" /> : <X className="w-4 h-4 text-muted-foreground" />}
                </button>
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight italic uppercase">LAW FIRM REGISTRATION</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5">
                        Step {step} of 2: {step === 1 ? 'Administrator Identity' : 'Firm Information & Details'}
                    </p>
                </div>
            </div>

            {/* Step 1: Admin Details */}
            {step === 1 && (
                <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-5 animate-slide-up">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Admin First Name</label>
                            <Input {...adminForm.register('firstName')} placeholder="John" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Admin Last Name</label>
                            <Input {...adminForm.register('lastName')} placeholder="Doe" className="h-12 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Admin Email</label>
                        <Input {...adminForm.register('email')} type="email" placeholder="admin@lawfirm.com" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Contact Number</label>
                        <Input {...adminForm.register('phone')} placeholder="+91 98765 43210" className="h-12 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Master Key</label>
                            <Input {...adminForm.register('password')} type="password" placeholder="********" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Verify Key</label>
                            <Input {...adminForm.register('confirm')} type="password" placeholder="********" className="h-12 rounded-xl" />
                        </div>
                    </div>
                    <Button type="submit" variant="gradient" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] mt-4">
                        Configure Firm Identity <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                </form>
            )}

            {/* Step 2: Firm Details */}
            {step === 2 && (
                <form onSubmit={firmForm.handleSubmit(onFinalSubmit)} className="space-y-5 animate-slide-up">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Legal Firm Name</label>
                        <Input {...firmForm.register('firmName')} placeholder="JusticeLynk Associate Partners" className="h-12 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Firm Reg. No</label>
                            <Input {...firmForm.register('registrationNumber')} placeholder="REG-2024-XXXX" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Est. Year</label>
                            <Input {...firmForm.register('establishedYear')} type="number" placeholder="2010" className="h-12 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Website <span className="opacity-50">(opt)</span></label>
                        <Input {...firmForm.register('website')} placeholder="https://firm.com" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Practice Specializations <span className="opacity-50">(comma separated)</span></label>
                        <Input {...firmForm.register('specializations')} placeholder="Corporate Law, Litigation, Real Estate" className="h-12 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Firm Contact Email <span className="opacity-50">(opt)</span></label>
                            <Input {...firmForm.register('firmEmail')} placeholder="contact@firm.com" className="h-12 rounded-xl" />
                            {firmForm.formState.errors.firmEmail && <p className="text-destructive text-[10px] px-1 font-bold italic">{firmForm.formState.errors.firmEmail.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Firm Contact Phone <span className="opacity-50">(opt)</span></label>
                            <Input {...firmForm.register('firmPhone')} placeholder="+91 98765 43211" className="h-12 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Firm Description <span className="opacity-50">(opt)</span></label>
                        <Textarea {...firmForm.register('description')} placeholder="Brief overview of the firm's history and mission..." className="rounded-xl min-h-[80px] bg-muted/40 border-border/40 focus:bg-background transition-all" />
                        <p className="text-[9px] text-muted-foreground text-right font-medium">Max 500 characters</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-1">Firm Address</label>
                        <Textarea {...firmForm.register('address')} placeholder="Full physical address of the firm headquarters..." className="rounded-xl min-h-[100px] bg-muted/40 border-border/40 focus:bg-background transition-all" />
                    </div>
                    <Button disabled={loading} type="submit" variant="gradient" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] mt-4 shadow-2xl transition-all hover:-translate-y-1">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Initializing Workspace...</> : 'Launch Organisation →'}
                    </Button>
                </form>
            )}

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Encrypted Organisational Data Protocol
                </p>
            </div>
        </div>
    );
}
