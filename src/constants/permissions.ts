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
