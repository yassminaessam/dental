import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    // Temporary cast to ensure access to Notification model even if TS types lag behind
    const db = prisma as unknown as { notification: any };
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, totalCount, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset,
      }),
      db.notification.count({ where: { userId } }),
      db.notification.count({ where: { userId, isRead: false } }),
    ]);

    return NextResponse.json({
      notifications,
      totalCount,
      unreadCount,
      hasMore: offset + notifications.length < totalCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const db = prisma as unknown as { notification: any };
    const body = await request.json();
    const {
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      link,
      priority,
      metadata,
    } = body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
        link,
        priority: priority || 'NORMAL',
        metadata,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete old read notifications
export async function DELETE(request: NextRequest) {
  try {
    const db = prisma as unknown as { notification: any };
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete notifications older than 30 days that are read
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db.notification.deleteMany({
      where: {
        userId,
        isRead: true,
        readAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      message: 'Old notifications deleted',
      count: result.count,
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}
