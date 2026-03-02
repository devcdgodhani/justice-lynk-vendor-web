import api from './api';
import { Plan, Subscription, ApiResponse } from '@/types';

export const subscriptionsApi = {
    getPublicPlans: (userType: string) =>
        api.get<ApiResponse<Plan[]>>(`/subscriptions/plans?userType=${userType}`).then((r) => r.data),

    getPlans: () =>
        api.get<ApiResponse<Plan[]>>('/subscriptions/plans').then((r) => r.data),

    getPlan: (id: string) =>
        api.get<ApiResponse<Plan>>(`/subscriptions/plans/${id}`).then((r) => r.data),

    getMySubscription: () =>
        api.get<ApiResponse<Subscription>>('/subscriptions/my').then((r) => r.data),

    selectPlan: (data: { planId: string; billingInterval: 'monthly' | 'yearly' }) =>
        api.post<ApiResponse<{ subscription: Subscription; accessToken: string; refreshToken: string }>>('/subscriptions/select-plan', data).then((r) => r.data),

    subscribe: (planId: string, billingInterval: 'monthly' | 'yearly' = 'monthly') =>
        api.post<ApiResponse<{ subscription: Subscription; accessToken: string; refreshToken: string }>>('/subscriptions/select-plan', { planId, billingInterval }).then((r) => r.data),

    cancelSubscription: (reason: string) =>
        api.post<ApiResponse<Subscription>>('/subscriptions/cancel', { reason }).then((r) => r.data),
};
