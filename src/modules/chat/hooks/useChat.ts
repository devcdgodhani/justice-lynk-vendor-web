'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { getSocket, SOCKET_EVENTS } from '@/services/socket.service';
import { chatApi } from '@/services/chat.api';
import { ChatMessage } from '@/types';

export function useChat(caseId: string) {
    const { user } = useAuthStore();
    const {
        messages, typingUsers, connected,
        setMessages, addMessage, addTypingUser, removeTypingUser, setConnected,
    } = useChatStore();

    const caseMessages = messages[caseId] ?? [];
    const caseTyping = typingUsers.filter((t) => t.caseId === caseId);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load history and join room
    useEffect(() => {
        if (!caseId || !user) return;

        const socket = getSocket();

        const init = async () => {
            console.log(`[Chat] Initializing case: ${caseId}`);
            if (!messages[caseId]) {
                try {
                    const res = await chatApi.getMessages(caseId, 1, 50);
                    const items = res.data?.items ?? [];
                    setMessages(caseId, items);
                } catch (err) {
                    console.error('[Chat] Failed to load messages:', err);
                }
            }
            console.log(`[Chat] Joining room: ${caseId}`);
            socket.emit(SOCKET_EVENTS.JOIN_ROOM, { caseId });
        };

        if (socket.connected) {
            console.log('[Chat] Socket already connected, initializing...');
            init();
        } else {
            console.log('[Chat] Waiting for socket connection...');
            socket.on('connect', () => {
                console.log('[Chat] Socket connected, initializing...');
                init();
            });
        }

        const onMessage = (msg: ChatMessage) => {
            if (msg.caseId === caseId) addMessage(caseId, msg);
        };
        const onRead = (data: { messageId: string; userId: string }) => {
            const list = messages[caseId] || [];
            const msg = list.find(m => m.id === data.messageId);
            if (msg && !msg.readBy.includes(data.userId)) {
                useChatStore.getState().updateMessage(caseId, data.messageId, {
                    readBy: [...msg.readBy, data.userId]
                });
            }
        };
        const onDeleted = (data: { messageId: string }) => {
            useChatStore.getState().deleteMessage(caseId, data.messageId);
        };
        const onTyping = (data: { userId: string; userName: string; caseId: string }) => {
            if (data.caseId === caseId) addTypingUser(data);
        };
        const onStopTyping = (data: { userId: string; caseId: string }) => {
            if (data.caseId === caseId) removeTypingUser(data.userId, caseId);
        };
        const onOnline = (data: { userId: string }) => {
            useChatStore.getState().addUserOnline(data.userId);
        };
        const onOffline = (data: { userId: string }) => {
            useChatStore.getState().removeUserOffline(data.userId);
        };
        const onInitialPresence = (userIds: string[]) => {
            useChatStore.getState().setOnlineUsers(userIds);
        };

        socket.on(SOCKET_EVENTS.NEW_MESSAGE, onMessage);
        socket.on(SOCKET_EVENTS.MESSAGE_READ, onRead);
        socket.on(SOCKET_EVENTS.MESSAGE_DELETED, onDeleted);
        socket.on(SOCKET_EVENTS.USER_TYPING, onTyping);
        socket.on(SOCKET_EVENTS.USER_STOP_TYPING, onStopTyping);
        socket.on(SOCKET_EVENTS.USER_ONLINE, onOnline);
        socket.on(SOCKET_EVENTS.USER_OFFLINE, onOffline);
        socket.on('initial_presence', onInitialPresence);

        socket.on(SOCKET_EVENTS.CONNECT, () => setConnected(true));
        socket.on(SOCKET_EVENTS.DISCONNECT, () => setConnected(false));
        setConnected(socket.connected);

        return () => {
            socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { caseId });
            socket.off(SOCKET_EVENTS.NEW_MESSAGE, onMessage);
            socket.off(SOCKET_EVENTS.MESSAGE_READ, onRead);
            socket.off(SOCKET_EVENTS.MESSAGE_DELETED, onDeleted);
            socket.off(SOCKET_EVENTS.USER_TYPING, onTyping);
            socket.off(SOCKET_EVENTS.USER_STOP_TYPING, onStopTyping);
            socket.off(SOCKET_EVENTS.USER_ONLINE, onOnline);
            socket.off(SOCKET_EVENTS.USER_OFFLINE, onOffline);
            socket.off('initial_presence', onInitialPresence);
            socket.off('connect', init);
        };
    }, [caseId, user]);

    const sendMessage = useCallback((content: string) => {
        if (!content.trim()) return;
        getSocket().emit(SOCKET_EVENTS.SEND_MESSAGE, { caseId, content });
    }, [caseId]);

    const markAsRead = useCallback((messageId: string) => {
        getSocket().emit(SOCKET_EVENTS.MESSAGE_READ, { messageId });
    }, []);

    const deleteMessage = useCallback((messageId: string) => {
        getSocket().emit(SOCKET_EVENTS.MESSAGE_DELETED, { messageId });
    }, []);

    const startTyping = useCallback(() => {
        const socket = getSocket();
        socket.emit(SOCKET_EVENTS.TYPING, { caseId });
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => stopTyping(), 3000);
    }, [caseId]);

    const stopTyping = useCallback(() => {
        getSocket().emit(SOCKET_EVENTS.STOP_TYPING, { caseId });
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    }, [caseId]);

    const onlineUsers = useChatStore((s) => s.onlineUsers);

    return { messages: caseMessages, typingUsers: caseTyping, connected, onlineUsers, sendMessage, startTyping, stopTyping, markAsRead, deleteMessage };
}
