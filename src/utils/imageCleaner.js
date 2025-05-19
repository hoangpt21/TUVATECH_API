import { removedImageService } from '../services/removedImageService.js';
import cron from 'node-cron';
cron.schedule('0 * * * *', async () => {
  try {
    console.log('🕒 Running scheduled image cleanup...');
    console.log('🧹 Starting image cleanup from Cloudinary...');
    await removedImageService.delete_file();
    console.log('✅ Image cleanup completed.');
  } catch (err) {
    console.error('❌ Failed to clean up images:', err);
  }
});
