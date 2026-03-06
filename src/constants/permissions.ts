export const CASE_STATUS_LABELS: Record<string, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
    CLOSED: 'Closed',
    ARCHIVED: 'Archived',
};

export const CASE_TYPE_LABELS: Record<string, string> = {
    CIVIL: 'Civil',
    CRIMINAL: 'Criminal',
    CORPORATE: 'Corporate',
    FAMILY: 'Family',
    PROPERTY: 'Property',
    LABOUR: 'Labour',
    OTHER: 'Other',
};

export const CASE_STATUS_COLORS: Record<string, string> = {
    OPEN: 'badge-active',
    IN_PROGRESS: 'badge-pending',
    PENDING: 'badge-pending',
    CLOSED: 'badge-closed',
    ARCHIVED: 'badge-closed',
};

// ─── MAIN WEB PERMISSIONS ──────────────────────────────────
export const PERMISSION_KEYS = {
    // Dashboards
    DASHBOARD_CLIENT_VIEW: 'client.overview.read',
    DASHBOARD_PROFESSIONAL_VIEW: 'professional.overview.read',
    DASHBOARD_LAWFIRM_VIEW: 'lawfirm.overview.read',

    // Cases
    CASES_LIST_VIEW: 'cases.list.read',
    CASES_LIST_CREATE: 'cases.list.create',
    CASES_LIST_EXPORT: 'cases.list.export',
    CASES_DETAILS_VIEW: 'cases.details.read',
    CASES_DETAILS_UPDATE: 'cases.details.update',
    CASES_DETAILS_ASSIGN: 'cases.details.assign',
    CASES_DETAILS_CLOSE: 'cases.details.close',
    CASES_DETAILS_DELETE: 'cases.details.delete',

    // Chat
    CHAT_MESSAGES_VIEW: 'chat.messages.read',
    CHAT_MESSAGES_SEND: 'chat.messages.send',
    CHAT_MESSAGES_DELETE: 'chat.messages.delete',

    // Professionals Marketplace
    PROFESSIONALS_MKT_VIEW: 'professionals.mkt.read',
    PROFESSIONALS_MKT_HIRE: 'professionals.mkt.hire',

    // Organization (Team & Settings)
    ORG_TEAM_VIEW: 'org.team.read',
    ORG_TEAM_INVITE: 'org.team.invite',
    ORG_TEAM_REMOVE: 'org.team.remove',
    ORG_TEAM_UPDATE: 'org.team.update',
    ORG_SETTINGS_VIEW: 'org.settings.read',
    ORG_SETTINGS_UPDATE: 'org.settings.update',

    // Billing
    BILLING_VIEW: 'user.billing.read',
    BILLING_UPDATE: 'user.billing.update',

    // Notifications
    NOTIFICATIONS_VIEW: 'user.notifications.read',
    NOTIFICATIONS_UPDATE: 'user.notifications.update',

    // User Settings
    PROFILE_VIEW: 'user.profile.read',
    PROFILE_UPDATE: 'user.profile.update',
    SECURITY_VIEW: 'user.security.read',
    SECURITY_UPDATE: 'user.security.update',

    // Storage
    STORAGE_VIEW: 'user.storage.read',
    STORAGE_CREATE: 'user.storage.create',
    STORAGE_UPDATE: 'user.storage.update',
    STORAGE_DELETE: 'user.storage.delete',
    STORAGE_UPLOAD: 'user.storage.upload',
    STORAGE_DOWNLOAD: 'user.storage.download',
} as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];
