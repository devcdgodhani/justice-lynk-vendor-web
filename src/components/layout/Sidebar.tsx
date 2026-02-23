'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Briefcase, MessageSquare, Building2,
    CreditCard, Settings, Bell, Users, ShieldCheck,
    Scale, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { toast } from 'sonner';
import { authApi } from '@/services/auth.api';
import { getInitials } from '@/lib/utils';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/cases', label: 'Cases', icon: Briefcase },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/organization', label: 'Organization', icon: Building2 },
    { href: '/professionals', label: 'Professionals', icon: Scale },
    { href: '/billing', label: 'Billing', icon: CreditCard },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
];

const adminItems: any[] = [];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearAuth, activeOrg } = useAuthStore();
    const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

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

    const isSuperAdmin = user?.role === 'super_admin';

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
                    <Scale className="w-5 h-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                    <span className="text-xl font-bold font-display tracking-tight text-white">
                        Justice<span className="text-primary-foreground/60">Lynk</span>
                    </span>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-premium">
                {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                            sidebarCollapsed ? 'justify-center' : '',
                            isActive(href)
                                ? 'bg-primary-foreground/10 text-white shadow-sm ring-1 ring-primary-foreground/20'
                                : 'text-sidebar-foreground/70 hover:bg-primary-foreground/5 hover:text-white',
                        )}
                        title={sidebarCollapsed ? label : undefined}
                    >
                        <Icon className={cn('flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110', isActive(href) ? 'text-primary' : '')} />
                        {!sidebarCollapsed && <span className="truncate tracking-wide">{label}</span>}
                    </Link>
                ))}

                {isSuperAdmin && (
                    <>
                        <div className="pt-6 pb-2">
                            <div className={cn("h-px bg-primary-foreground/5", sidebarCollapsed ? "mx-2" : "mx-1")} />
                            {!sidebarCollapsed && (
                                <p className="mt-4 px-4 text-[10px] font-bold text-primary-foreground/30 uppercase tracking-[0.2em]">Management</p>
                            )}
                        </div>
                        {adminItems.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                                    sidebarCollapsed ? 'justify-center' : '',
                                    isActive(href)
                                        ? 'bg-primary-foreground/10 text-white shadow-sm ring-1 ring-primary-foreground/20'
                                        : 'text-sidebar-foreground/70 hover:bg-primary-foreground/5 hover:text-white',
                                )}
                                title={sidebarCollapsed ? label : undefined}
                            >
                                <Icon className={cn('flex-shrink-0 h-5 w-5', isActive(href) ? 'text-primary' : '')} />
                                {!sidebarCollapsed && <span className="truncate tracking-wide">{label}</span>}
                            </Link>
                        ))}
                    </>
                )}
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
                                <span className="text-white text-sm font-bold">
                                    {getInitials(user.firstName, user.lastName)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-primary-foreground/40 truncate font-medium">{user.email}</p>
                            </div>
                        </div>
                    ) : (
                        user && (
                            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-md">
                                <span className="text-white text-sm font-bold">
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
                    ? <ChevronRight className="h-4 w-4 text-white" />
                    : <ChevronLeft className="h-4 w-4 text-white" />
                }
            </button>
        </aside>
    );
}
