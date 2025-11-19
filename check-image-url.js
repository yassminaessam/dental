const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImageUrl() {
  const img = await prisma.clinicalImage.findFirst({
    where: {
      imageUrl: {
        contains: '622eb126-cd7f-48f1-9b53-5183e8d23a77'
      }
    }
  });
  
  console.log('Image URL from DB:', img?.imageUrl);
  await prisma.$disconnect();
}

checkImageUrl();
