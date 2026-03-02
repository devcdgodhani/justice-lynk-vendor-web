export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { firstName: string; lastName: string; email: string; password: string; phone?: string; userType?: UserType; }
export interface RegisterClientPayload extends RegisterPayload { interests?: string[]; }
export interface RegisterProfessionalPayload extends RegisterPayload { barRegistration?: string; specializations: string[]; experienceYears: number; bio?: string; practiceAreas: string[]; languages?: string[]; location?: string; hourlyRate?: number; }
export interface RegisterLawFirmPayload extends RegisterPayload { firmName: string; registrationNumber?: string; establishedYear?: number; website?: string; address?: any; specializations?: string[]; description?: string; firmEmail?: string; firmPhone?: string; }
export interface MfaVerifyPayload { mfaTempToken: string; token: string; }
export interface MfaBackupCodePayload { mfaTempToken: string; backupCode: string; }
export interface VerifyEmailOtpPayload { email: string; otp: string; }
export interface ResendOtpPayload { email: string; }
export interface ForgotPasswordPayload { email: string; }
export interface VerifyForgotPasswordOtpPayload { email: string; otp: string; }
export interface ResetPasswordPayload { resetToken: string; newPassword: string; }
export interface AuthTokens { accessToken: string; refreshToken: string; }
export interface LoginResult {
    mfaRequired: boolean;
    emailVerificationRequired: boolean;
    approvalPending?: boolean;
    approvalRejected?: boolean;
    suspended?: boolean;
    approvalNote?: string;
    email?: string;
    mfaTempToken?: string;
    user?: User;
    accessToken?: string;
    refreshToken?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedData<T> {
    items: T[];
    meta: PaginationMeta;
}

// Simplify to just PaginatedData as the API response wrapper handles the 'data' key
export type PaginatedResponse<T> = PaginatedData<T>;

// ─── Enums ──────────────────────────────────────────────────────────────────
export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'CLOSED' | 'ARCHIVED';
export type CaseType = 'CIVIL' | 'CRIMINAL' | 'CORPORATE' | 'FAMILY' | 'PROPERTY' | 'LABOUR' | 'OTHER';
export type UserType = 'client' | 'advocate' | 'law_firm_admin' | 'admin' | 'super_admin';

// ─── Core Entities ───────────────────────────────────────────────────────────
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    userType: UserType;
    approvalStatus: string;
    avatar?: string;
    isActive: boolean;
    isSuperAdmin?: boolean;
    subscription?: any; // Simplified for now
    createdAt: string;
}

export interface Organization {
    id: string;
    name: string;
    type?: string;
    description?: string;
    website?: string;
    country?: string;
    logoUrl?: string;
    createdAt: string;
}

export interface OrgMember {
    id: string;
    userId: string;
    orgId: string;
    roleId?: string;
    user?: User;
    role?: Role;
    joinedAt: string;
}

export interface Permission {
    id: string;
    featureKey?: string;
    feature?: { id: string; key: string; name: string };
    action?: { id: string; key: string; name: string };
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions?: Permission[];
}

export interface Case {
    id: string;
    caseNumber: string;
    title: string;
    type: CaseType;
    status: CaseStatus;
    description?: string;
    jurisdiction?: string;
    hearingDate?: string;
    assignments?: CaseAssignment[];
    createdAt: string;
    updatedAt: string;
}

export interface CaseAssignment {
    id: string;
    caseId: string;
    professionalId: string;
    role: string;
    assignedAt: string;
}

export interface CaseDocument {
    id: string;
    caseId: string;
    name: string;
    fileUrl: string;
    fileType: string;
    createdAt: string;
}

export interface CreateCasePayload {
    title: string;
    type: CaseType;
    description?: string;
    jurisdiction?: string;
    hearingDate?: Date;
}

export interface Attachment {
    name: string;
    s3Key: string;
    mimeType: string;
}

export interface ChatMessage {
    id: string;
    caseId: string;
    senderId: string;
    content: string;
    isSystem: boolean;
    readBy: string[];
    attachments?: Attachment[];
    createdAt: string;
    updatedAt: string;
    sender?: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    body?: string;
    isRead: boolean;
    type?: string;
    data?: Record<string, unknown>;
    createdAt: string;
}

export interface PlanLimit {
    id: string;
    planId: string;
    key: string;
    value: number;
}

export interface Plan {
    id: string;
    name: string;
    slug: string;
    description?: string;
    targetUserType: UserType;
    monthlyPrice: number;
    yearlyPrice: number;
    monthlyOfferPrice?: number;
    yearlyOfferPrice?: number;
    monthlyDiscount?: number;
    yearlyDiscount?: number;
    features?: Record<string, unknown>;
    isActive: boolean;
    modules: Array<{ module: { name: string; key: string } }>;
    limits: PlanLimit[];
}

export interface UserFeature {
    id: string;
    name: string;
    key: string;
    path?: string;
    isInPlan: boolean;
}

export interface UserModule {
    id: string;
    name: string;
    key: string;
    icon?: string;
    description?: string;
    path: string;
    isInPlan: boolean;
    features: UserFeature[];
}


export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: string;
    startDate: string;
    endDate?: string;
    plan?: Plan;
}

export interface Payment {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    createdAt: string;
}

export interface RazorpayOrder {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
}

export interface Professional {
    id: string;
    userId: string;
    bio?: string;
    barRegistration?: string;
    specializations?: string[];
    experienceYears?: number;
    location?: string;
    hourlyRate?: number;
    type?: string;
    city?: string;
    isVerified?: boolean;
    status: string;
    user?: User;
}

export interface AuditLog {
    id: string;
    userId?: string;
    orgId?: string;
    module: string;
    action: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    createdAt: string;
    user?: User;
}

export interface AdminStats {
    totalUsers: number;
    totalOrgs: number;
    totalCases: number;
    activeSubs: number;
    revenue?: number;
}

export interface RevenueData {
    monthly: Array<{ month: string; amount: number }>;
    total: number;
    currency: string;
}

export interface MfaStatus {
    enabled: boolean;
    secret?: string;
    backupCodesCount?: number;
}

export interface Session {
    id: string;
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    expiresAt?: string;
}
