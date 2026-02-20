import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casesApi } from '@/services/cases.api';
import { CreateCasePayload, CaseStatus } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

export function useCases(params?: {
    page?: number; limit?: number; status?: string;
    type?: string; search?: string;
}) {
    const { activeOrg } = useAuthStore();
    return useQuery({
        queryKey: ['cases', activeOrg?.id, params],
        queryFn: () => casesApi.getCases(params),
        enabled: !!activeOrg,
        select: (r) => r.data,
    });
}

export function useCase(id: string) {
    return useQuery({
        queryKey: ['case', id],
        queryFn: () => casesApi.getCaseById(id),
        enabled: !!id,
        select: (r) => r.data,
    });
}

export function useCreateCase() {
    const qc = useQueryClient();
    const { activeOrg } = useAuthStore();
    return useMutation({
        mutationFn: (data: CreateCasePayload) => casesApi.createCase(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['cases', activeOrg?.id] });
            toast.success('Case created successfully');
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });
}

export function useUpdateCase(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<CreateCasePayload>) => casesApi.updateCase(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['case', id] });
            qc.invalidateQueries({ queryKey: ['cases'] });
            toast.success('Case updated');
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });
}

export function useUpdateCaseStatus(caseId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ status, note }: { status: CaseStatus; note?: string }) =>
            casesApi.updateCaseStatus(caseId, status, note),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['case', caseId] });
            qc.invalidateQueries({ queryKey: ['cases'] });
            toast.success('Case status updated');
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });
}

export function useAssignProfessional(caseId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ professionalId, role }: { professionalId: string; role: string }) =>
            casesApi.assignProfessional(caseId, professionalId, role),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['case', caseId] });
            toast.success('Professional assigned successfully');
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });
}

export function useCaseDocuments(caseId: string) {
    return useQuery({
        queryKey: ['case-documents', caseId],
        queryFn: () => casesApi.getDocuments(caseId),
        enabled: !!caseId,
        select: (r) => r.data ?? [],
    });
}
export function useDeleteCase() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => casesApi.deleteCase(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['cases'] });
            toast.success('Case deleted successfully');
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });
}
