'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCase, useCaseDocuments, useUpdateCaseStatus, useDeleteCase } from '@/modules/cases/hooks/useCases';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import { CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '@/constants/permissions';
import { useAuthStore } from '@/store/auth.store';
import { CaseStatus } from '@/types';
import {
    ArrowLeft, Loader2, MessageSquare, FileText, Users,
    Clock, Calendar, MapPin, Trash2, Shield, Share2,
    MoreHorizontal, Download, ExternalLink, Scale, Plus, History
} from 'lucide-react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import ChatWindow from '@/modules/chat/components/ChatWindow';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const tabs = [
    { id: 'Overview', icon: History, label: 'Timeline' },
    { id: 'Chat', icon: MessageSquare, label: 'Discussions' },
    { id: 'Documents', icon: FileText, label: 'Repository' },
    { id: 'Assignments', icon: Users, label: 'Legal Team' }
] as const;

type Tab = (typeof tabs)[number]['id'];

const STATUSES: CaseStatus[] = ['OPEN', 'IN_PROGRESS', 'PENDING', 'CLOSED', 'ARCHIVED'];

export default function CaseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { can, isHydrated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<Tab>('Overview');

    const { data: caseData, isLoading: caseLoading } = useCase(id);
    const { data: documents } = useCaseDocuments(id);
    const updateStatus = useUpdateCaseStatus(id);
    const deleteCase = useDeleteCase();

    const handleDelete = async () => {
        await deleteCase.mutateAsync(id);
        router.push('/cases');
    };

    if (!isHydrated || caseLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                    <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Securing Case Intelligence...</p>
                </div>
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="text-center py-32 centered-container">
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h2 className="text-2xl font-bold font-display text-foreground">Intelligence Not Found</h2>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto italic">The requested case files are either missing or your clearance level does not permit access.</p>
                <Button variant="ghost" asChild className="mt-8 font-bold text-primary">
                    <Link href="/cases">← Return to Portfolio</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="centered-container py-8 space-y-8 animate-fade-in">
            {/* Flagship Header */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-xl px-2 hover:bg-muted">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 tracking-widest uppercase">
                        <Link href="/cases" className="hover:text-primary transition-colors">Portfolios</Link>
                        <span>/</span>
                        <span className="text-foreground/40">{caseData.caseNumber}</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge variant="premium" className="px-3 py-1 rounded-lg">
                                {CASE_TYPE_LABELS[caseData.type]}
                            </Badge>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <Clock className="h-3.5 w-3.5" />
                                Updated {formatDate(caseData.updatedAt || caseData.createdAt)}
                            </div>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">
                            {caseData.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]" />
                                <span className="text-sm font-bold text-foreground/80 uppercase tracking-widest">
                                    {CASE_STATUS_LABELS[caseData.status]} Status
                                </span>
                            </div>
                            {caseData.jurisdiction && (
                                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm">{caseData.jurisdiction}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="secondary" size="lg" className="rounded-2xl border-none">
                            <Share2 className="mr-2 h-5 w-5" />
                            Secure Share
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="lg" className="rounded-2xl text-destructive hover:bg-destructive/5">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem] p-8">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-bold font-display">Confirm Destructive Action</AlertDialogTitle>
                                    <AlertDialogDescription className="text-lg py-4 leading-relaxed">
                                        This will permanently expunge <span className="text-foreground font-bold">{caseData.caseNumber}</span> from the vault. This action is irreversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="pt-4 gap-4">
                                    <AlertDialogCancel className="rounded-2xl font-bold p-6">Abort Mission</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl font-bold p-6">
                                        Yes, Purge Files
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>

            {/* Sophisticated Tab Navigation */}
            <div className="flex items-center gap-1 border-b border-border/40 overflow-x-auto scrollbar-none">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "group relative flex items-center gap-2.5 px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap",
                            activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <tab.icon className={cn("h-4 w-4 transition-transform duration-300", activeTab === tab.id && "scale-110")} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_-2px_8px_hsl(var(--primary)/0.3)] animate-in slide-in-from-bottom-1" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Logic */}
            <div className="min-h-[500px]">
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Summary & Timeline */}
                        <div className="lg:col-span-2 space-y-10">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold font-display">Executive Summary</h3>
                                <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-6 py-2 bg-muted/40 rounded-r-[2rem]">
                                    {caseData.description ?? "Critical case brief pending. Await further intelligence documentation."}
                                </p>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-xl font-bold font-display">Audit Timeline</h3>
                                <div className="space-y-0 relative">
                                    <div className="absolute left-[21px] top-4 bottom-4 w-px bg-border/40" />
                                    {[
                                        { title: 'Case Re-entry', time: '10:45 AM', type: 'system', desc: 'Case status adjusted to In Progress.' },
                                        { title: 'Evidence Ingestion', time: 'Yesterday', type: 'file', desc: 'New document: "Evidence_Batch_A.pdf" added to vault.' },
                                        { title: 'Intel Assigned', time: '2 days ago', type: 'user', desc: 'Siddharth V. assigned as Lead Professional.' },
                                        { title: 'Protocol Initialized', time: formatDate(caseData.createdAt), type: 'system', desc: 'Case record established in central records.' },
                                    ].map((event, i) => (
                                        <div key={i} className="relative pl-12 pb-10 group last:pb-0">
                                            <div className="absolute left-[14px] top-1 w-4 h-4 rounded-full border-2 border-primary bg-background z-10 group-hover:scale-125 transition-transform" />
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-bold text-foreground">{event.title}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{event.time}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground font-medium">{event.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Side Panel Controls */}
                        <div className="space-y-8">
                            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-2xl glass">
                                <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                                    <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Intelligence Config</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Lifecycle Tracking</label>
                                        <Select
                                            value={caseData.status}
                                            onValueChange={(val) => updateStatus.mutate({ status: val as CaseStatus })}
                                        >
                                            <SelectTrigger className="h-14 bg-muted/40 border-border/50 rounded-2xl text-[10px] font-bold uppercase tracking-widest px-4 focus:ring-4 focus:ring-primary/10">
                                                <SelectValue placeholder="SET STATUS" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                                                {STATUSES.map(s => (
                                                    <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase tracking-widest">
                                                        {CASE_STATUS_LABELS[s]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <div className="flex justify-between items-center group cursor-pointer">
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Hearing Protocol</p>
                                                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {caseData.hearingDate ? formatDateTime(caseData.hearingDate) : "TBD"}
                                                </p>
                                            </div>
                                            <Calendar className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex justify-between items-center group cursor-pointer">
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Intel Count</p>
                                                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {documents?.length ?? 0} Master Documents
                                                </p>
                                            </div>
                                            <FileText className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>

                                    <Button className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20 mt-4 group">
                                        Generate Analytics
                                        <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'Chat' && (
                    <div className="glass rounded-[3rem] overflow-hidden border-none shadow-2xl relative" style={{ height: '70vh' }}>
                        <ChatWindow caseId={id} />
                    </div>
                )}

                {activeTab === 'Documents' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold font-display">Intelligence Repository</h2>
                            <Button className="rounded-xl px-6">
                                <Plus className="mr-2 h-4 w-4" />
                                Upload Master
                            </Button>
                        </div>

                        {!documents?.length ? (
                            <div className="py-32 text-center bg-muted/20 border border-dashed border-border rounded-[3rem]">
                                <FileText className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-foreground">Vault is Empty</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-2 italic">Zero intelligence assets have been authorized for this case yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {documents.map((doc) => (
                                    <Card key={doc.id} className="group hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[2rem]">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                                    <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                                                </div>
                                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/5 text-primary">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors truncate mb-1">{doc.name}</h4>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formatDate(doc.createdAt)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Assignments' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold font-display">Assigned Legal Council</h2>
                            <Button variant="secondary" className="rounded-xl px-6">
                                <Plus className="mr-2 h-4 w-4" />
                                Modify Roster
                            </Button>
                        </div>

                        {!caseData.assignments?.length ? (
                            <div className="py-32 text-center bg-muted/20 border border-dashed border-border rounded-[3rem]">
                                <Users className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-foreground">No Operatives Assigned</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-2 italic">A legal team must be authorized to manage this investigation.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {caseData.assignments.map((a) => (
                                    <Card key={a.id} className="rounded-3xl border-none shadow-lg hover:shadow-xl transition-all">
                                        <CardContent className="p-6 flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-full brand-gradient flex items-center justify-center text-xl font-bold text-primary-foreground shadow-lg">
                                                P
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-foreground">Verified Professional</h4>
                                                <p className="text-sm font-bold text-primary uppercase tracking-[0.1em]">{a.role}</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Active since {formatDate(a.assignedAt)}
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="rounded-xl">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
