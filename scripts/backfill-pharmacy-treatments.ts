import 'dotenv/config';
import prisma from '@/lib/prisma';

const PHARMACY_SUFFIX = ' - Pharmacy Dispense';

async function main() {
  console.log('Starting pharmacy treatment backfill...');

  const pendingPharmacyTreatments = await prisma.treatment.findMany({
    where: {
      status: 'Pending',
      procedure: { endsWith: PHARMACY_SUFFIX },
      appointments: { none: {} },
    },
    select: {
      id: true,
      patient: true,
      procedure: true,
      createdAt: true,
    },
  });

  if (pendingPharmacyTreatments.length === 0) {
    console.log('No pending pharmacy treatments found. Nothing to update.');
    return;
  }

  console.log(`Found ${pendingPharmacyTreatments.length} pending pharmacy treatments to update.`);

  const ids = pendingPharmacyTreatments.map((treatment) => treatment.id);
  const updated = await prisma.treatment.updateMany({
    where: { id: { in: ids } },
    data: { status: 'Completed' },
  });

  console.log(`Marked ${updated.count} pharmacy treatments as Completed.`);
}

main()
  .catch((error) => {
    console.error('Failed to backfill pharmacy treatments', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
