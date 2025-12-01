// Script to create User accounts for all Patients who don't have one
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createPatientUsers() {
  console.log('=== Creating User accounts for Patients without accounts ===\n');
  
  // Get all patients
  const patients = await prisma.patient.findMany();
  console.log(`Found ${patients.length} patients in database\n`);
  
  let created = 0;
  let alreadyHasUser = 0;
  let errors = 0;
  
  for (const patient of patients) {
    // Check if user exists with this email
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: { 
          equals: patient.email, 
          mode: 'insensitive' 
        } 
      }
    });
    
    if (existingUser) {
      console.log(`✓ ${patient.name} ${patient.lastName} (${patient.email}) - Already has User account`);
      
      // Make sure the user has patientId linked
      if (!existingUser.patientId) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { patientId: patient.id }
        });
        console.log(`  → Linked user to patient record`);
      }
      
      alreadyHasUser++;
      continue;
    }
    
    // Create user account for this patient
    try {
      // Generate a default password (should be changed by patient)
      const defaultPassword = 'Patient123!';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      
      const newUser = await prisma.user.create({
        data: {
          email: patient.email,
          passwordHash: passwordHash,
          firstName: patient.name,
          lastName: patient.lastName || '',
          role: 'patient',
          isActive: true,
          patientId: patient.id,
          phone: patient.phone || null,
          address: patient.address || null,
          permissions: ['view_own_appointments', 'view_own_records', 'book_appointments']
        }
      });
      
      console.log(`✓ Created User account for ${patient.name} ${patient.lastName} (${patient.email})`);
      console.log(`  → User ID: ${newUser.id}`);
      console.log(`  → Default password: ${defaultPassword}`);
      created++;
    } catch (error) {
      console.error(`✗ Failed to create user for ${patient.email}: ${error.message}`);
      errors++;
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`Already had User accounts: ${alreadyHasUser}`);
  console.log(`New User accounts created: ${created}`);
  console.log(`Errors: ${errors}`);
  
  await prisma.$disconnect();
}

createPatientUsers().catch(console.error);
