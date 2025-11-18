const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreFtpUrls() {
  try {
    console.log('🔧 Restoring FTP URLs for clinical images...');
    
    // Get all clinical images
    const images = await prisma.clinicalImage.findMany();
    
    console.log(`Found ${images.length} clinical images`);
    
    let updatedCount = 0;
    const ftpPublicUrl = 'https://dental.adsolutions-eg.com/assets';
    
    for (const image of images) {
      // Check if URL is local path
      if (image.imageUrl.startsWith('/clinical-images/') || 
          image.imageUrl.startsWith('clinical-images/')) {
        
        // Remove leading slash if present
        const cleanPath = image.imageUrl.startsWith('/') 
          ? image.imageUrl.slice(1) 
          : image.imageUrl;
        
        // Convert to FTP URL
        const ftpUrl = `${ftpPublicUrl}/${cleanPath}`;
        
        console.log(`\nUpdating image ${image.id}:`);
        console.log(`  Patient: ${image.patient}`);
        console.log(`  Type: ${image.type}`);
        console.log(`  Old URL: ${image.imageUrl}`);
        console.log(`  New URL: ${ftpUrl}`);
        
        await prisma.clinicalImage.update({
          where: { id: image.id },
          data: { imageUrl: ftpUrl },
        });
        
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} image URLs to FTP`);
    console.log(`✅ ${images.length - updatedCount} images already had FTP URLs`);
  } catch (error) {
    console.error('❌ Error restoring FTP URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreFtpUrls();
