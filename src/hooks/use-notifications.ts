import { useState, useEffect, useCallback } from 'react';

interface NotificationItem {
  id: string;
  type: 'appointment' | 'inventory' | 'message' | 'chat';
  [key: string]: any;
}

/**
 * Custom hook to manage notification read status
 * Stores read notification IDs in localStorage
 */
export function useNotifications(userId: string | undefined) {
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  // Load read notifications from localStorage on mount
  useEffect(() => {
    if (!userId) return;
    
    const storageKey = `readNotifications_${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setReadNotifications(new Set(parsed));
      } catch (error) {
        console.error('Error parsing read notifications:', error);
      }
    }
  }, [userId]);

  // Save read notifications to localStorage whenever they change
  const saveToStorage = useCallback((notificationIds: Set<string>) => {
    if (!userId) return;
    
    const storageKey = `readNotifications_${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(notificationIds)));
  }, [userId]);

  // Mark a notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setReadNotifications(prev => {
      const updated = new Set(prev);
      updated.add(notificationId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback((notificationIds: string[]) => {
    setReadNotifications(prev => {
      const updated = new Set(prev);
      notificationIds.forEach(id => updated.add(id));
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Check if a notification is read
  const isRead = useCallback((notificationId: string): boolean => {
    return readNotifications.has(notificationId);
  }, [readNotifications]);

  // Filter out read notifications from an array
  const filterUnread = useCallback(<T extends NotificationItem>(
    notifications: T[]
  ): T[] => {
    return notifications.filter(notification => !isRead(notification.id));
  }, [isRead]);

  // Clear all read notifications (useful for testing or reset)
  const clearReadNotifications = useCallback(() => {
    if (!userId) return;
    
    const storageKey = `readNotifications_${userId}`;
    localStorage.removeItem(storageKey);
    setReadNotifications(new Set());
  }, [userId]);

  // Clear old notifications (older than 30 days)
  const clearOldReadNotifications = useCallback(() => {
    // This is a simple implementation - in a real app, you'd want to store timestamps
    // and check against them. For now, this just clears all.
    clearReadNotifications();
  }, [clearReadNotifications]);

  return {
    readNotifications,
    markAsRead,
    markMultipleAsRead,
    isRead,
    filterUnread,
    clearReadNotifications,
  };
}

export type UseNotificationsReturn = ReturnType<typeof useNotifications>;
