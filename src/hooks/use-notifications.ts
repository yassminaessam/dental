import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string | null;
  relatedType?: string | null;
  link?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  priority: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Custom hook to manage notifications from Neon database
 * Fetches, marks as read, and syncs across all devices
 */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!userId || userId === 'undefined' || userId === 'null') {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        userId,
        unreadOnly: 'false',
        limit: '50',
      });

      const response = await fetch(`/api/notifications?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          (payload && (payload.error || payload.message)) ||
          `Failed to fetch notifications (status ${response.status})`;
        console.warn('Notifications request failed', {
          status: response.status,
          message,
        });
        setError(message);
        return;
      }

      const data = await response.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load notifications on mount and when userId changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [userId]);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(async (notificationIds: string[]) => {
    if (!userId) return;

    try {
      await Promise.all(
        notificationIds.map(id =>
          fetch(`/api/notifications/${id}/read`, {
            method: 'PATCH',
          })
        )
      );

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id)
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  }, [userId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [userId]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [userId, notifications]);

  // Get only unread notifications
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}

export type UseNotificationsReturn = ReturnType<typeof useNotifications>;
