const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncPatientsUsers() {
  console.log('Starting patient-user sync...\n');

  try {
    // 1. Find all patient role users without patientId
    const patientUsers = await prisma.user.findMany({
      where: {
        role: 'patient',
        patientId: null
      }
    });

    console.log(`Found ${patientUsers.length} patient users without linked Patient records`);

    let patientsCreated = 0;
    let usersLinked = 0;

    for (const user of patientUsers) {
      // Check if patient already exists with same email
      const existingPatient = await prisma.patient.findUnique({
        where: { email: user.email }
      });

      if (existingPatient) {
        // Link user to existing patient
        await prisma.user.update({
          where: { id: user.id },
          data: { patientId: existingPatient.id }
        });
        console.log(`Linked user ${user.email} to existing patient ${existingPatient.id}`);
        usersLinked++;
      } else {
        // Create new patient record
        const newPatient = await prisma.patient.create({
          data: {
            name: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || 'Not provided',
            dob: new Date(2000, 0, 1), // Default DOB
            status: 'Active',
            address: user.address || null
          }
        });

        // Link user to new patient
        await prisma.user.update({
          where: { id: user.id },
          data: { patientId: newPatient.id }
        });

        console.log(`Created patient ${newPatient.id} for user ${user.email}`);
        patientsCreated++;
      }
    }

    // 2. Find all patients with emails that match user accounts but not linked
    const allPatients = await prisma.patient.findMany();
    
    for (const patient of allPatients) {
      const user = await prisma.user.findFirst({
        where: { 
          email: { equals: patient.email, mode: 'insensitive' },
          patientId: null
        }
      });
      
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { patientId: patient.id }
        });
        console.log(`Linked user ${user.email} to patient ${patient.id}`);
        usersLinked++;
      }
    }

    console.log('\n=== SYNC COMPLETE ===');
    console.log(`Patients created: ${patientsCreated}`);
    console.log(`Users linked: ${usersLinked}`);

  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncPatientsUsers();
