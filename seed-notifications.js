/**
 * Seed script to create test notifications
 * Run with: node seed-notifications.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test notifications...');

  // Find an admin user to send notifications to
  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' },
  });

  if (!adminUser) {
    console.error('❌ No admin user found. Please create an admin user first.');
    return;
  }

  console.log(`📧 Creating notifications for user: ${adminUser.email}`);

  // Create sample notifications
  const notifications = [
    {
      userId: adminUser.id,
      type: 'APPOINTMENT_PENDING',
      title: 'موعد جديد قيد الانتظار',
      message: 'موعد جديد من أحمد محمد - فحص دوري',
      relatedId: 'test-appointment-1',
      relatedType: 'appointment',
      link: '/appointments',
      priority: 'HIGH',
      metadata: {
        patientName: 'أحمد محمد',
        appointmentType: 'فحص دوري',
      },
    },
    {
      userId: adminUser.id,
      type: 'INVENTORY_LOW_STOCK',
      title: 'مخزون منخفض',
      message: 'قفازات طبية - المخزون المتبقي: 15',
      relatedId: 'test-inventory-1',
      relatedType: 'inventory',
      link: '/inventory',
      priority: 'NORMAL',
      metadata: {
        itemName: 'قفازات طبية',
        stockLevel: 15,
      },
    },
    {
      userId: adminUser.id,
      type: 'INVENTORY_OUT_OF_STOCK',
      title: 'صنف نفذ من المخزن',
      message: 'أقنعة وجه - نفذ من المخزن',
      relatedId: 'test-inventory-2',
      relatedType: 'inventory',
      link: '/inventory',
      priority: 'URGENT',
      metadata: {
        itemName: 'أقنعة وجه',
        stockLevel: 0,
      },
    },
    {
      userId: adminUser.id,
      type: 'CHAT_MESSAGE',
      title: 'رسالة محادثة جديدة',
      message: 'سارة أحمد: متى يمكنني الحضور للمتابعة؟',
      relatedId: 'test-chat-1',
      relatedType: 'chat',
      link: '/admin/chats',
      priority: 'NORMAL',
      metadata: {
        patientName: 'سارة أحمد',
        messagePreview: 'متى يمكنني الحضور للمتابعة؟',
      },
    },
    {
      userId: adminUser.id,
      type: 'MESSAGE_RECEIVED',
      title: 'رسالة جديدة من مريض',
      message: 'محمد علي: استفسار عن الأسعار',
      relatedId: 'test-message-1',
      relatedType: 'patient-message',
      link: '/communications',
      priority: 'NORMAL',
      metadata: {
        patientName: 'محمد علي',
        patientEmail: 'mohamed@example.com',
        subject: 'استفسار عن الأسعار',
      },
    },
  ];

  let created = 0;
  for (const notification of notifications) {
    try {
      await prisma.notification.create({
        data: notification,
      });
      created++;
      console.log(`✅ Created: ${notification.title}`);
    } catch (error) {
      console.error(`❌ Failed to create: ${notification.title}`, error.message);
    }
  }

  console.log(`\n🎉 Successfully created ${created}/${notifications.length} test notifications`);
  console.log(`👤 User: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
