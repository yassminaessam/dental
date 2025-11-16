/**
 * Notification Service
 * Handles creating notifications in the database
 */

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
  link?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  metadata?: any;
}

export class NotificationService {
  /**
   * Create a notification in the database
   */
  static async createNotification(params: CreateNotificationParams): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  /**
   * Create notification for pending appointment
   */
  static async notifyPendingAppointment(
    userId: string,
    appointmentId: string,
    patientName: string,
    appointmentType: string
  ): Promise<boolean> {
    return this.createNotification({
      userId,
      type: 'APPOINTMENT_PENDING',
      title: 'موعد جديد قيد الانتظار',
      message: `موعد جديد من ${patientName} - ${appointmentType}`,
      relatedId: appointmentId,
      relatedType: 'appointment',
      link: `/appointments?id=${appointmentId}`,
      priority: 'HIGH',
      metadata: { patientName, appointmentType },
    });
  }

  /**
   * Create notification for low stock item
   */
  static async notifyLowStock(
    userId: string,
    itemId: string,
    itemName: string,
    stockLevel: number
  ): Promise<boolean> {
    const priority = stockLevel === 0 ? 'URGENT' : 'HIGH';
    const title = stockLevel === 0 ? 'صنف نفذ من المخزن' : 'مخزون منخفض';
    const message = stockLevel === 0
      ? `${itemName} نفذ من المخزن`
      : `${itemName} - المخزون المتبقي: ${stockLevel}`;

    return this.createNotification({
      userId,
      type: stockLevel === 0 ? 'INVENTORY_OUT_OF_STOCK' : 'INVENTORY_LOW_STOCK',
      title,
      message,
      relatedId: itemId,
      relatedType: 'inventory',
      link: `/inventory?id=${itemId}`,
      priority,
      metadata: { itemName, stockLevel },
    });
  }

  /**
   * Create notification for new patient message
   */
  static async notifyPatientMessage(
    userId: string,
    messageId: string,
    patientName: string,
    patientEmail: string,
    subject: string
  ): Promise<boolean> {
    return this.createNotification({
      userId,
      type: 'MESSAGE_RECEIVED',
      title: 'رسالة جديدة من مريض',
      message: `رسالة من ${patientName}: ${subject}`,
      relatedId: messageId,
      relatedType: 'patient-message',
      link: `/communications?messageId=${messageId}`,
      priority: 'NORMAL',
      metadata: { patientName, patientEmail, subject },
    });
  }

  /**
   * Create notification for new chat message
   */
  static async notifyChatMessage(
    userId: string,
    conversationId: string,
    patientName: string,
    messagePreview: string
  ): Promise<boolean> {
    return this.createNotification({
      userId,
      type: 'CHAT_MESSAGE',
      title: 'رسالة محادثة جديدة',
      message: `${patientName}: ${messagePreview}`,
      relatedId: conversationId,
      relatedType: 'chat',
      link: `/admin/chats?conversation=${conversationId}`,
      priority: 'NORMAL',
      metadata: { patientName, messagePreview },
    });
  }

  /**
   * Create multiple notifications for all admin users
   */
  static async notifyAllAdmins(
    adminUserIds: string[],
    type: string,
    title: string,
    message: string,
    options?: {
      relatedId?: string;
      relatedType?: string;
      link?: string;
      priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
      metadata?: any;
    }
  ): Promise<void> {
    await Promise.all(
      adminUserIds.map(userId =>
        this.createNotification({
          userId,
          type,
          title,
          message,
          ...options,
        })
      )
    );
  }
}
