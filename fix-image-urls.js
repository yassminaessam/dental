const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixImageUrls() {
  try {
    console.log('🔧 Fixing clinical image URLs...');
    
    // Get all clinical images
    const images = await prisma.clinicalImage.findMany();
    
    console.log(`Found ${images.length} clinical images`);
    
    let updatedCount = 0;
    
    for (const image of images) {
      // Check if URL points to production server
      if (image.imageUrl.startsWith('https://dental.adsolutions-eg.com/assets/')) {
        // Convert to local path
        const localUrl = image.imageUrl.replace('https://dental.adsolutions-eg.com/assets', '');
        
        console.log(`\nUpdating image ${image.id}:`);
        console.log(`  Old URL: ${image.imageUrl}`);
        console.log(`  New URL: ${localUrl}`);
        
        await prisma.clinicalImage.update({
          where: { id: image.id },
          data: { imageUrl: localUrl },
        });
        
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} image URLs`);
    console.log(`✅ ${images.length - updatedCount} images already had correct URLs`);
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls();
