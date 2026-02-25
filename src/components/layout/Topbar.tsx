'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Menu, ChevronDown, ArrowLeftRight, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { orgApi } from '@/services/org.api';
import { notificationsApi } from '@/services/notifications.api';
import { authApi } from '@/services/auth.api';
import { getInitials, cn } from '@/lib/utils';
import { Organization } from '@/types';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function Topbar() {
    const router = useRouter();
    const { user, activeOrg, setActiveOrg, clearAuth } = useAuthStore();
    const { toggleSidebar } = useUIStore();
    const [orgMenuOpen, setOrgMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: orgsRes } = useQuery({
        queryKey: ['my-orgs'],
        queryFn: orgApi.getMyOrgs,
        enabled: !!user,
        staleTime: 1000 * 60 * 10,
    });

    const { data: unreadRes } = useQuery({
        queryKey: ['notifications-unread'],
        queryFn: notificationsApi.getUnreadCount,
        refetchInterval: 30000,
        enabled: !!user,
    });

    const { data: notifsRes } = useQuery({
        queryKey: ['notifications-preview'],
        queryFn: () => notificationsApi.getNotifications(1, 5),
        enabled: notifOpen && !!user,
    });

    const markAllRead = useMutation({
        mutationFn: notificationsApi.markAllRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-preview'] });
            toast.success('All notifications marked as read');
        },
    });

    const orgs = orgsRes?.data ?? [];
    const unreadCount = unreadRes?.data?.count ?? 0;
    const notifications = notifsRes?.data?.items ?? [];

    const handleOrgSwitch = (org: Organization) => {
        setActiveOrg(org);
        setOrgMenuOpen(false);
        queryClient.clear();
        toast.success(`Switched to ${org.name}`);
        router.refresh();
    };

    const handleLogout = async () => {
        try { await authApi.logout(); } catch { }
        clearAuth();
        // Remove cookie
        document.cookie = 'jl-access-token=; path=/; max-age=0';
        router.push('/login');
    };

    return (
        <header className="h-20 bg-background/60 border-b border-border/40 flex items-center justify-between px-8 flex-shrink-0 backdrop-blur-xl sticky top-0 z-30">
            {/* Left side */}
            <div className="flex items-center gap-6">
                <button onClick={toggleSidebar} className="p-2.5 hover:bg-muted rounded-xl transition-all active:scale-95 lg:hidden">
                    <Menu className="h-5 w-5 text-foreground" />
                </button>

                {/* Organization Context */}
                {activeOrg && (
                    <div className="relative">
                        <button
                            onClick={() => { setOrgMenuOpen(!orgMenuOpen); setUserMenuOpen(false); setNotifOpen(false); }}
                            className="flex items-center gap-3 px-4 py-2 bg-muted/40 border border-border/40 rounded-xl hover:bg-muted/70 hover:shadow-md transition-all active:scale-[0.98] group"
                        >
                            <div className="w-6 h-6 rounded-lg brand-gradient flex items-center justify-center shadow-sm">
                                <span className="text-primary-foreground text-[10px] font-bold">{activeOrg.name.charAt(0)}</span>
                            </div>
                            <span className="font-semibold text-sm text-foreground/80 group-hover:text-foreground">{activeOrg.name}</span>
                            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", orgMenuOpen && "rotate-180")} />
                        </button>

                        {orgMenuOpen && (
                            <div className="absolute top-full left-0 mt-3 w-72 bg-card border border-border/50 rounded-2xl shadow-xl z-50 p-2 animate-fade-in glass">
                                <p className="text-[10px] font-bold text-muted-foreground/50 px-3 py-2 uppercase tracking-[0.2em]">Switch Organization</p>
                                <div className="space-y-1">
                                    {orgs.map((org) => (
                                        <button key={org.id} onClick={() => handleOrgSwitch(org)}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                                                org.id === activeOrg.id ? 'bg-primary/5 text-primary shadow-sm ring-1 ring-primary/10' : 'hover:bg-muted text-foreground/70 hover:text-foreground',
                                            )}>
                                            <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="text-primary-foreground text-xs font-bold">{org.name.charAt(0)}</span>
                                            </div>
                                            <span className="font-semibold truncate">{org.name}</span>
                                            {org.id === activeOrg.id && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-border/50">
                                    <button onClick={() => router.push('/organization?action=create')}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                                        <Plus className="h-4 w-4" />
                                        Create New Org
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                <ThemeToggle />

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => { setNotifOpen(!notifOpen); setOrgMenuOpen(false); setUserMenuOpen(false); }}
                        className={cn(
                            "relative p-2.5 hover:bg-muted rounded-xl transition-all active:scale-95",
                            notifOpen && "bg-muted shadow-inner"
                        )}
                    >
                        <Bell className="h-5 w-5 text-foreground/70" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute top-full right-0 mt-3 w-96 bg-card border border-border/50 rounded-2xl shadow-xl z-50 animate-fade-in glass">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 text-card-foreground">
                                <h3 className="font-bold text-foreground text-sm tracking-tight">Activity Feed</h3>
                                {unreadCount > 0 && (
                                    <button onClick={() => markAllRead.mutate()}
                                        className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity">
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[400px] overflow-y-auto scrollbar-premium p-2">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-10 text-center text-muted-foreground/60 text-sm font-medium italic">All caught up!</div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className={cn('p-3 rounded-xl transition-colors mb-1', !n.isRead ? 'bg-primary/5' : 'hover:bg-muted/50')}>
                                            <div className="flex gap-3">
                                                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", !n.isRead ? "bg-primary" : "bg-transparent")} />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-foreground/90 leading-tight">{n.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 border-t border-border/50">
                                <button onClick={() => { router.push('/notifications'); setNotifOpen(false); }}
                                    className="w-full text-center py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-all">
                                    Open Notification Center
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Account */}
                {user && (
                    <div className="relative ml-2">
                        <button
                            onClick={() => { setUserMenuOpen(!userMenuOpen); setOrgMenuOpen(false); setNotifOpen(false); }}
                            className="flex items-center gap-3 p-1 pl-3 pr-2 bg-muted/30 border border-border/30 rounded-full hover:bg-muted/60 transition-all active:scale-[0.98]"
                        >
                            <div className="hidden sm:block text-right">
                                <p className="text-xs font-bold text-foreground leading-none">{user.firstName} {user.lastName}</p>
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter mt-1">{user.role}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center shadow-sm">
                                <span className="text-primary-foreground text-[10px] font-bold">{getInitials(user.firstName, user.lastName)}</span>
                            </div>
                        </button>

                        {userMenuOpen && (
                            <div className="absolute top-full right-0 mt-3 w-56 bg-card border border-border/50 rounded-2xl shadow-xl z-50 p-2 animate-fade-in glass">
                                <div className="px-3 py-2 mb-2">
                                    <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Account</p>
                                </div>
                                <button onClick={() => { router.push('/settings'); setUserMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2.5 text-sm font-semibold text-foreground/70 hover:bg-muted hover:text-foreground rounded-xl transition-all">
                                    Profile Settings
                                </button>
                                <div className="my-2 h-px bg-border/50" />
                                <button onClick={handleLogout}
                                    className="w-full text-left px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/5 rounded-xl transition-all">
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Backdrop for menus */}
            {(orgMenuOpen || userMenuOpen || notifOpen) && (
                <div className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[2px]" onClick={() => { setOrgMenuOpen(false); setUserMenuOpen(false); setNotifOpen(false); }} />
            )}
        </header>
    );
}
