// Script to clean up orphaned files from FTP server
// This will delete files on FTP that don't have corresponding database records
// Run with: node scripts/cleanup-ftp-orphaned-files.js

const { PrismaClient } = require('@prisma/client');
const { Client } = require('basic-ftp');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function listFTPFiles(client, remotePath) {
  try {
    const list = await client.list(remotePath);
    const files = [];
    
    for (const item of list) {
      if (item.isDirectory) {
        // Recursively list subdirectories
        const subPath = path.posix.join(remotePath, item.name);
        const subFiles = await listFTPFiles(client, subPath);
        files.push(...subFiles);
      } else {
        // Add file with full path
        const fullPath = path.posix.join(remotePath, item.name);
        files.push(fullPath);
      }
    }
    
    return files;
  } catch (error) {
    console.warn(`⚠️  Could not list directory ${remotePath}:`, error.message);
    return [];
  }
}

async function cleanupOrphanedFiles() {
  const client = new Client();
  client.ftp.verbose = false;

  try {
    console.log('🔍 Connecting to FTP server...');
    
    // Connect to FTP server
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true',
      secureOptions: {
        rejectUnauthorized: false,
      },
    });

    console.log('✅ FTP connected');

    // List all files in clinical-images directory
    const clinicalImagesPath = path.posix.join(process.env.FTP_BASE_PATH, 'clinical-images');
    console.log('🔍 Scanning FTP directory:', clinicalImagesPath);
    
    const ftpFiles = await listFTPFiles(client, clinicalImagesPath);
    console.log(`Found ${ftpFiles.length} file(s) on FTP server`);

    // Get all image URLs from database
    const dbImages = await prisma.clinicalImage.findMany({
      select: { imageUrl: true }
    });

    console.log(`Found ${dbImages.length} image(s) in database`);

    // Extract FTP paths from database URLs
    const dbFtpPaths = new Set(
      dbImages.map(img => {
        try {
          const url = new URL(img.imageUrl);
          const relativePath = url.pathname.replace(/^\/assets\//, '');
          return path.posix.join(process.env.FTP_BASE_PATH, relativePath);
        } catch {
          return null;
        }
      }).filter(Boolean)
    );

    // Find orphaned files (on FTP but not in database)
    const orphanedFiles = ftpFiles.filter(ftpPath => !dbFtpPaths.has(ftpPath));

    console.log(`\n📊 Found ${orphanedFiles.length} orphaned file(s)`);

    if (orphanedFiles.length === 0) {
      console.log('✅ No orphaned files to clean up!');
      return;
    }

    // Display orphaned files
    console.log('\n🗑️  Orphaned files to be deleted:');
    orphanedFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });

    console.log('\n🗑️  Deleting orphaned files...');

    // Delete orphaned files
    let deletedCount = 0;
    for (const filePath of orphanedFiles) {
      try {
        await client.remove(filePath);
        console.log(`  ✅ Deleted: ${path.basename(filePath)}`);
        deletedCount++;
      } catch (error) {
        console.error(`  ❌ Failed to delete ${path.basename(filePath)}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully cleaned up ${deletedCount} orphaned file(s)!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.close();
    await prisma.$disconnect();
  }
}

cleanupOrphanedFiles();
