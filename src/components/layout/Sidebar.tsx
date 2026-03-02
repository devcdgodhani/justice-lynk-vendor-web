'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Briefcase, MessageSquare, Building2,
    CreditCard, Settings, Bell, Users, ShieldCheck,
    Scale, ChevronLeft, ChevronRight, ChevronDown, LogOut, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { UserModule, UserFeature } from '@/types';
import { toast } from 'sonner';
import { authApi } from '@/services/auth.api';
import { getInitials } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
    'main.dashboard': LayoutDashboard,
    'professional.dashboard': LayoutDashboard,
    'lawfirm.dashboard': LayoutDashboard,
    'main.cases': Briefcase,
    'main.chat': MessageSquare,
    'main.organization': Building2,
    'main.professionals': Scale,
    'main.billing': CreditCard,
    'main.notifications': Bell,
    'main.settings': Settings,
};

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearAuth, userModules } = useAuthStore();
    const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleExpand = (key: string) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch { /* ignore */ } finally {
            clearAuth();
            document.cookie = 'jl-access-token=; path=/; max-age=0';
            router.push('/login');
            toast.success('Logged out successfully');
        }
    };

    const isActive = (href: string) =>
        href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

    const isSuperAdmin = user?.userType === 'super_admin' || user?.isSuperAdmin;

    return (
        <aside className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shadow-xl',
            sidebarCollapsed ? 'w-20' : 'w-64',
        )}>
            {/* Logo Section */}
            <div className={cn(
                'flex items-center gap-3 px-6 h-20 flex-shrink-0',
                sidebarCollapsed && 'justify-center px-0',
            )}>
                <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                    <Scale className="w-5 h-5 text-primary-foreground" />
                </div>
                {!sidebarCollapsed && (
                    <span className="text-xl font-bold font-display tracking-tight text-sidebar-foreground">
                        Justice<span className="text-primary-foreground/60">Lynk</span>
                    </span>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-premium">
                {!sidebarCollapsed && (
                    <div className="px-3 mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sidebar-foreground/30">
                            Workspace {user?.subscription ? 'Core' : 'Setup'}
                        </p>
                    </div>
                )}
                {userModules.map((mod: UserModule) => {
                    const Icon = ICON_MAP[mod.key] || LayoutDashboard;
                    const isLocked = !mod.isInPlan && !isSuperAdmin;
                    const href = mod.path || mod.features?.[0]?.path;
                    const hasSubFeatures = mod.features && mod.features.length > 1;
                    const isExpanded = expanded[mod.key];

                    return (
                        <div key={mod.key} className="space-y-1">
                            <div className="relative group">
                                <Link
                                    href={isLocked ? '/plan-select' : (href || '#')}
                                    onClick={(e) => {
                                        if (hasSubFeatures && !sidebarCollapsed) {
                                            // Optional: let them toggle expand instead of navigating if it has sub-features? 
                                            // Actually, usually click takes you to first feature, but we'll toggle expand too.
                                            toggleExpand(mod.key);
                                        }
                                    }}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group uppercase',
                                        sidebarCollapsed ? 'justify-center' : '',
                                        isLocked ? 'text-sidebar-foreground/30 cursor-pointer' : (
                                            isActive(href || '#')
                                                ? 'bg-primary-foreground/10 text-primary-foreground shadow-sm ring-1 ring-primary-foreground/20'
                                                : 'text-sidebar-foreground/70 hover:bg-primary-foreground/5 hover:text-sidebar-foreground'
                                        )
                                    )}
                                    title={sidebarCollapsed ? (isLocked ? `${mod.name} (Locked)` : mod.name) : undefined}
                                >
                                    <Icon className={cn('flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110', isActive(href || '#') && !isLocked ? 'text-primary' : '')} />
                                    {!sidebarCollapsed && <span className="truncate tracking-wide">{mod.name}</span>}
                                    {!sidebarCollapsed && isLocked && <Lock className="ml-auto h-3.5 w-3.5 text-primary/60" />}
                                    {!sidebarCollapsed && !isLocked && hasSubFeatures && (
                                        <ChevronDown className={cn("ml-auto h-3.5 w-3.5 text-sidebar-foreground/40 transition-transform duration-200", isExpanded && "rotate-180")} />
                                    )}
                                </Link>
                                {isLocked && (
                                    <Link
                                        href="/plan-select"
                                        className="absolute inset-0 z-10 cursor-pointer pointer-events-auto"
                                        title="Upgrade plan to access"
                                    />
                                )}
                            </div>

                            {/* Sub-features - Visible even if locked to show what's available */}
                            {!sidebarCollapsed && hasSubFeatures && isExpanded && (
                                <div className="ml-9 space-y-1 border-l-2 border-primary-foreground/5 pl-2 animate-fade-in">
                                    {mod.features.map((feat: UserFeature) => {
                                        const featHref = isLocked ? '/plan-select' : (feat.path || href);
                                        const isFeatLocked = isLocked || (!feat.isInPlan && !isSuperAdmin);
                                        // Skip if path is same as parent and index is 0 (it's the 'overview' we already link at top level)
                                        // Actually, let's just show all distinct ones
                                        return (
                                            <Link
                                                key={feat.key}
                                                href={featHref || '#'}
                                                className={cn(
                                                    "block py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200",
                                                    isFeatLocked
                                                        ? "text-sidebar-foreground/30 cursor-pointer"
                                                        : (pathname === featHref
                                                            ? "text-primary-foreground bg-primary/10"
                                                            : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-primary-foreground/5"
                                                        )
                                                )}
                                            >
                                                {feat.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="p-4 flex-shrink-0">
                <div className={cn(
                    "rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-3 transition-colors hover:bg-primary-foreground/10",
                    sidebarCollapsed && "p-2 flex flex-col items-center gap-2"
                )}>
                    {!sidebarCollapsed && user ? (
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center flex-shrink-0 shadow-md">
                                <span className="text-primary-foreground text-sm font-bold">
                                    {getInitials(user.firstName, user.lastName)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-primary-foreground truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-primary-foreground/40 truncate font-medium">{user.email}</p>
                            </div>
                        </div>
                    ) : (
                        user && (
                            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-md">
                                    <span className="text-primary-foreground text-sm font-bold">
                                    {getInitials(user.firstName, user.lastName)}
                                </span>
                            </div>
                        )
                    )}

                    <button
                        onClick={handleLogout}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-all w-full group',
                            sidebarCollapsed ? 'justify-center' : '',
                        )}
                        title={sidebarCollapsed ? 'Logout' : undefined}
                    >
                        <LogOut className="flex-shrink-0 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        {!sidebarCollapsed && <span className="font-semibold px-2">Sign out</span>}
                    </button>
                </div>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={toggleSidebarCollapsed}
                className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-primary-foreground/10 transition-all shadow-lg active:scale-90"
            >
                {sidebarCollapsed
                    ? <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                    : <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
                }
            </button>
        </aside>
    );
}
