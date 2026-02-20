'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Search, Loader2 } from 'lucide-react';
import { casesApi } from '@/services/cases.api';
import { useAuthStore } from '@/store/auth.store';
import { cn, formatDate } from '@/lib/utils';
import ChatWindow from '@/modules/chat/components/ChatWindow';

export default function ChatPage() {
    const { activeOrg } = useAuthStore();
    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['cases-chat', activeOrg?.id],
        queryFn: () => casesApi.getCases({ limit: 50 }),
        enabled: !!activeOrg,
        select: r => r.data?.items ?? [],
    });

    const cases = data ?? [];
    const filtered = cases.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-8rem)] glass rounded-xl overflow-hidden">
            {/* Case List */}
            <div className="w-72 border-r border-border flex flex-col flex-shrink-0">
                <div className="p-3 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="SEARCH CASE RECORDS..."
                            className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border/40 rounded-xl text-sm text-foreground font-bold placeholder:text-muted-foreground/30 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-card transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground text-sm">No cases found</div>
                    ) : (
                        filtered.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCaseId(c.id)}
                                className={cn(
                                    'w-full text-left px-4 py-4 border-b border-border/40 transition-all hover:bg-muted/30 group',
                                    selectedCaseId === c.id && 'bg-primary/5 border-l-2 border-l-primary',
                                )}
                            >
                                <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{c.caseNumber} · {formatDate(c.createdAt)}</p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedCaseId ? (
                    <ChatWindow caseId={selectedCaseId} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center p-8">
                        <div>
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-foreground font-medium">Select a case</p>
                            <p className="text-muted-foreground text-sm mt-1">Choose a case from the left to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
