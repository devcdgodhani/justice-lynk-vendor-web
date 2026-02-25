'use client';

import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useChat } from '@/modules/chat/hooks/useChat';
import { useAuthStore } from '@/store/auth.store';
import { cn, formatDateTime, getInitials } from '@/lib/utils';
import { Send, Wifi, WifiOff, Loader2, MessageSquare, Trash2, CheckCheck } from 'lucide-react';
import { ChatMessage } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ChatWindowProps {
    caseId: string;
}

export default function ChatWindow({ caseId }: ChatWindowProps) {
    const { user } = useAuthStore();
    const { messages, typingUsers, connected, onlineUsers, sendMessage, startTyping, stopTyping, markAsRead, deleteMessage } = useChat(caseId);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        sendMessage(trimmed);
        setInput('');
        stopTyping();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (val: string) => {
        setInput(val);
        if (val.trim()) startTyping();
        else stopTyping();
    };

    const isOwn = (msg: ChatMessage) => msg.senderId === user?.id;

    return (
        <div className="flex flex-col h-full bg-background/30 backdrop-blur-xl animate-fade-in">
            {/* High-End Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 glass">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center shadow-md">
                        <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground font-display tracking-tight">Intelligence Feed</h3>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">Secure End-to-End Channel</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {connected ? (
                        <Badge variant="success" className="px-2 py-0.5 rounded-lg flex items-center gap-1.5 shadow-[0_0_8px_hsl(var(--success)/0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_4px_hsl(var(--success))]" />
                            <span className="text-[10px] font-bold tracking-wider uppercase">Live</span>
                        </Badge>
                    ) : (
                            <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                            <WifiOff className="h-3 w-3" />
                            <span className="text-[10px] font-bold tracking-wider uppercase">Offline</span>
                        </Badge>
                    )}
                </div>
            </div>

            {/* Premium Message Stream */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-premium">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center px-10 leading-relaxed">
                            No protocol logs yet.<br />Initialize the conversation.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const own = isOwn(msg);
                        const prevOwn = idx > 0 ? isOwn(messages[idx - 1]) : null;
                        const showAvatar = !own && prevOwn !== false;

                        return (
                            <div key={msg.id} className={cn(
                                'flex gap-4 group transition-all duration-300',
                                own ? 'flex-row-reverse' : 'flex-row',
                                prevOwn === own ? 'mt-1' : 'mt-6'
                            )}>
                                {!own && (
                                    <div className={cn(
                                        "w-9 h-9 rounded-2xl flex-shrink-0 mt-1 transition-all relative",
                                        showAvatar ? "brand-gradient shadow-md" : "opacity-0"
                                    )}>
                                        {showAvatar && (
                                            <>
                                                <span className="text-white text-[10px] font-bold flex items-center justify-center h-full">
                                                    {msg.sender ? getInitials(msg.sender.firstName, msg.sender.lastName) : '?'}
                                                </span>
                                                {onlineUsers.includes(msg.senderId) && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-background rounded-full shadow-[0_0_8px_hsl(var(--success))]" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                                <div className={cn('max-w-[80%] space-y-1', own ? 'items-end' : 'items-start', 'flex flex-col')}>
                                    {showAvatar && msg.sender && (
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-xs font-bold text-foreground/80 lowercase tracking-tight">
                                                {msg.sender.firstName} {msg.sender.lastName}
                                            </span>
                                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">
                                                {formatDateTime(msg.createdAt).split(' ')[1]}
                                            </span>
                                        </div>
                                    )}
                                    <div className="relative group/msg">
                                        <div
                                            onMouseEnter={() => !own && !msg.readBy.includes(user?.id!) && markAsRead(msg.id)}
                                            className={cn(
                                                'px-4 py-2.5 rounded-[1.25rem] text-sm font-medium leading-relaxed border transition-all duration-200 shadow-sm',
                                                own
                                                    ? 'bg-primary text-primary-foreground border-primary/20 rounded-tr-none hover:shadow-primary/20'
                                                    : 'bg-card text-foreground border-border/40 rounded-tl-none hover:border-primary/20 hover:shadow-md'
                                            )}
                                        >
                                            {msg.content}
                                        </div>
                                        {own && (
                                            <div className="flex items-center gap-2 absolute top-1/2 -left-12 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => deleteMessage(msg.id)}
                                                    className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                                <div className={cn(
                                                    "transition-colors",
                                                    msg.readBy.length > 0 ? "text-primary" : "text-muted-foreground/30"
                                                )}>
                                                    <CheckCheck className="h-3 w-3" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Fluid Typing Indicator */}
                <div className={cn(
                    "transition-all duration-300 transform",
                    typingUsers.length > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                )}>
                    <div className="flex items-center gap-3 px-1 mt-4">
                        <div className="flex gap-1.5 p-2 bg-primary/10 border border-primary/20 rounded-full px-3 shadow-inner">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest animate-pulse">
                            Secure Transmitting: {typingUsers.map(t => t.userName).join(', ')}...
                        </span>
                    </div>
                </div>

                <div ref={messagesEndRef} />
            </div>

            {/* Integrated Command Center */}
            <div className="p-6 bg-card/40 border-t border-border/40 backdrop-blur-md">
                <div className="relative group">
                    <textarea
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ENTER SECURE MESSAGE PROTOCOL..."
                        rows={1}
                        className="w-full pl-6 pr-16 py-4 bg-muted/40 border border-border/40 rounded-2xl text-sm text-foreground font-medium placeholder:text-muted-foreground/40 placeholder:font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-card/90 resize-none shadow-glass transition-all"
                        style={{ minHeight: '56px', maxHeight: '160px' }}
                    />
                    <div className="absolute right-2 bottom-2">
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || !connected}
                            className="flex items-center justify-center w-10 h-10 brand-gradient text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 disabled:shadow-none"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3 px-1">
                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">Protocol: Secure Socket Layer v4.2</span>
                </div>
            </div>
        </div>
    );
}
