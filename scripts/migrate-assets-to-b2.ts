import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { StorageService } from '../src/server/services/storageService';

// Load .env.local
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

interface ImageMigrationTask {
  inputPath: string;
  fileKey: string;
  maxWidth?: number;
  quality?: number;
}

const tasks: ImageMigrationTask[] = [
  // Categories
  { inputPath: 'public/images/CATEGORY/men.png', fileKey: 'categories/men.webp', maxWidth: 800, quality: 82 },
  { inputPath: 'public/images/CATEGORY/women.png', fileKey: 'categories/women.webp', maxWidth: 800, quality: 82 },
  { inputPath: 'public/images/CATEGORY/hoodies.png', fileKey: 'categories/hoodies.webp', maxWidth: 800, quality: 82 },
  { inputPath: 'public/images/CATEGORY/oversizetshirt.png', fileKey: 'categories/oversized-tees.webp', maxWidth: 800, quality: 82 },
  { inputPath: 'public/images/CATEGORY/bootom.png', fileKey: 'categories/bottoms.webp', maxWidth: 800, quality: 82 },
  { inputPath: 'public/images/CATEGORY/shirt.png', fileKey: 'categories/shirts.webp', maxWidth: 800, quality: 82 },

  // Together In Style
  { inputPath: 'public/images/TOGETHER/royalpair.png', fileKey: 'together/royal-pair.webp', maxWidth: 1000, quality: 84 },
  { inputPath: 'public/images/TOGETHER/nightin.png', fileKey: 'together/night-in.webp', maxWidth: 1000, quality: 84 },
  { inputPath: 'public/images/TOGETHER/madefor2.png', fileKey: 'together/made-for-two.webp', maxWidth: 1000, quality: 84 },
  { inputPath: 'public/images/TOGETHER/sport.png', fileKey: 'together/sport-together.webp', maxWidth: 1000, quality: 84 },

  // Standard Heroes
  { inputPath: 'public/images/heroimage1.png', fileKey: 'hero/hero1.webp', maxWidth: 1920, quality: 85 },
  { inputPath: 'public/images/heroimage2.png', fileKey: 'hero/hero2.webp', maxWidth: 1920, quality: 85 },
  { inputPath: 'public/images/heroimage3.png', fileKey: 'hero/hero3.webp', maxWidth: 1920, quality: 85 },

  // Signature
  { inputPath: 'public/images/signature.png', fileKey: 'campaigns/signature.webp', maxWidth: 1200, quality: 84 },
];

async function main() {
  console.log('=== AVEEZ FASHION — OPTIMIZE ASSETS & B2 MIGRATION ===');
  console.log(`B2 configured: ${StorageService.isB2Configured()}`);

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (const task of tasks) {
    if (!fs.existsSync(task.inputPath)) {
      console.warn(`Skipping missing source file: ${task.inputPath}`);
      continue;
    }

    const origStat = fs.statSync(task.inputPath);
    totalOriginalBytes += origStat.size;
    const origSizeKb = (origStat.size / 1024).toFixed(1);

    console.log(`\nProcessing: ${task.inputPath} (${origSizeKb} KB) -> ${task.fileKey}`);

    let pipeline = sharp(task.inputPath);
    if (task.maxWidth) {
      pipeline = pipeline.resize({ width: task.maxWidth, withoutEnlargement: true });
    }
    const webpBuffer = await pipeline
      .webp({ quality: task.quality || 82, effort: 5 })
      .toBuffer();

    totalOptimizedBytes += webpBuffer.length;
    const optSizeKb = (webpBuffer.length / 1024).toFixed(1);
    const savings = (((origStat.size - webpBuffer.length) / origStat.size) * 100).toFixed(1);
    console.log(` -> WebP created: ${optSizeKb} KB (${savings}% savings)`);

    console.log(` -> Uploading to Backblaze B2 & local uploads cache...`);
    const result = await StorageService.uploadCampaignAsset(webpBuffer, task.fileKey, 'image/webp');
    console.log(` -> Uploaded: ${result.url} (${result.storageProvider})`);
  }

  const origMb = (totalOriginalBytes / (1024 * 1024)).toFixed(2);
  const optMb = (totalOptimizedBytes / (1024 * 1024)).toFixed(2);
  const totalSavings = (((totalOriginalBytes - totalOptimizedBytes) / totalOriginalBytes) * 100).toFixed(1);

  console.log('\n================ MIGRATION SUMMARY ================');
  console.log(`Original total size:  ${origMb} MB`);
  console.log(`Optimized total size: ${optMb} MB`);
  console.log(`Total payload reduction: ${totalSavings}%!`);
  console.log('All optimized assets are uploaded to B2 and cached locally in public/uploads/');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

