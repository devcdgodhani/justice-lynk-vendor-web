'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Briefcase, Info, ShieldCheck, Scale, FileSignature, MapPin, Calendar } from 'lucide-react';
import { useCreateCase } from '@/modules/cases/hooks/useCases';
import { CaseType } from '@/types';
import { CASE_TYPE_LABELS } from '@/constants/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const TYPES: CaseType[] = ['CIVIL', 'CRIMINAL', 'CORPORATE', 'FAMILY', 'PROPERTY', 'LABOUR', 'OTHER'];

const createCaseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    type: z.enum(['CIVIL', 'CRIMINAL', 'CORPORATE', 'FAMILY', 'PROPERTY', 'LABOUR', 'OTHER']),
    description: z.string().optional(),
    jurisdiction: z.string().optional(),
    hearingDate: z.string().optional(),
});

type CreateCaseForm = z.infer<typeof createCaseSchema>;

const inputCls = 'w-full px-6 py-4 bg-muted/40 border border-border/60 rounded-2xl text-sm font-bold text-foreground placeholder:text-muted-foreground/30 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-card transition-all duration-300';
const labelCls = 'block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2.5 ml-1';

export default function CreateCasePage() {
    const router = useRouter();
    const createCase = useCreateCase();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateCaseForm>({
        resolver: zodResolver(createCaseSchema),
        defaultValues: { type: 'CIVIL' },
    });

    const onSubmit = async (data: CreateCaseForm) => {
        const result = await createCase.mutateAsync({
            ...data,
            hearingDate: data.hearingDate ? (new Date(data.hearingDate) as unknown as any) : undefined,
        });
        if (result.data?.id) {
            router.push(`/cases/${result.data.id}`);
        } else {
            router.push('/cases');
        }
    };

    return (
        <div className="centered-container py-12 max-w-4xl animate-fade-in">
            <div className="flex flex-col gap-10">
                {/* Protocol Header */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl px-2 hover:bg-muted">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <Link href="/cases" className="hover:text-primary transition-colors">Portfolios</Link>
                            <span>/</span>
                            <span className="text-foreground/40">Intake Protocol</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">
                            New Case Intake
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg italic">
                            Initialize a secure intelligence record for final adjudication.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className={labelCls}>Primary Designation *</label>
                                    <div className="relative group">
                                        <input
                                            {...register('title')}
                                            placeholder="e.g. ASSET RECOVERY PROTOCOL - ALPHA"
                                            className={inputCls}
                                        />
                                        <FileSignature className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    {errors.title && <p className="text-destructive text-[10px] font-bold uppercase tracking-widest mt-2 ml-1">{errors.title.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelCls}>Intelligence Domain *</label>
                                        <div className="relative">
                                            <select {...register('type')} className={inputCls + ' appearance-none cursor-pointer focus:bg-card'}>
                                                {TYPES.map(t => <option key={t} value={t}>{CASE_TYPE_LABELS[t]}</option>)}
                                            </select>
                                            <Scale className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/20 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Jurisdiction Code</label>
                                        <div className="relative group">
                                            <input {...register('jurisdiction')} placeholder="e.g. CENTRAL ADJUDICATION OFFICE" className={inputCls} />
                                            <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Case Detail Brief</label>
                                    <textarea
                                        {...register('description')}
                                        rows={5}
                                        placeholder="OUTLINE THE CORE INTELLIGENCE AND LEGAL ARGUMENTS..."
                                        className={inputCls + ' resize-none'}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Scheduled Adjudication</label>
                                    <div className="relative group">
                                        <input {...register('hearingDate')} type="date" className={inputCls + ' cursor-pointer'} />
                                        <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.back()}
                                    className="flex-1 h-16 rounded-[2rem] font-bold tracking-widest uppercase text-xs"
                                >
                                    Abort
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || createCase.isPending}
                                    className="flex-1 h-16 rounded-[2rem] font-bold tracking-widest uppercase text-xs shadow-xl shadow-primary/20 group"
                                >
                                    {(isSubmitting || createCase.isPending) ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Initialize Record
                                            <Briefcase className="ml-2 h-4 w-4 transform group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-4 self-start">
                        <Card className="rounded-[2.5rem] border-none shadow-2xl glass p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold font-display">Secure Intake</h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                    All information provided during this protocol is encrypted and accessible only by authorized legal council.
                                </p>
                            </div>

                            <div className="pt-6 border-t border-border/40 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Info className="h-4 w-4 text-primary mt-0.5" />
                                    <p className="text-xs font-bold text-foreground/70 uppercase tracking-widest leading-relaxed">
                                        Required fields must be completed to initialize the audit trail.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Badge variant="premium" className="w-full justify-center py-2 rounded-xl text-[10px] tracking-[0.2em] font-bold">
                                    SYSTEM READY
                                </Badge>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
