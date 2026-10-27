import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { StorageService } from '../src/server/services/storageService';
import { Settings } from '../src/server/models/Settings';
import { CampaignAssetMetadata } from '../src/types';

// Load .env.local into process.env if not loaded
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

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://fashionaveez_db_user:BjDWwAmPsGhsDFUF@cluster0.g2ch40a.mongodb.net/aveez_fashion?appName=Cluster0';

async function main() {
  console.log('=== AVEEZ FASHION DIWALI CAMPAIGN ASSET PROCESSING & B2 UPLOAD ===');

  const desktopSrc =
    'C:/Users/lohar/.gemini/antigravity-ide/brain/e149e62a-ca18-49da-b39f-e743346f6b14/diwali_hero_clean_desktop_1793039406824.jpg';
  const mobileSrc =
    'C:/Users/lohar/.gemini/antigravity-ide/brain/e149e62a-ca18-49da-b39f-e743346f6b14/diwali_hero_clean_mobile_1793039425758.jpg';
  const firstHeroSrc =
    'C:/Users/lohar/.gemini/antigravity-ide/brain/e149e62a-ca18-49da-b39f-e743346f6b14/diwali_hero_desktop_1793039386739.jpg';

  if (!fs.existsSync(desktopSrc) || !fs.existsSync(mobileSrc)) {
    throw new Error('AI generated campaign source images not found in brain directory.');
  }

  const assetsToProcess = [
    {
      id: 'diwali-hero-desktop',
      fileKey: 'campaigns/diwali/hero-desktop.webp',
      purpose: 'Homepage Diwali Hero — Desktop Editorial',
      variant: 'desktop' as const,
      process: async () => {
        const logoBuf = await sharp('public/brand/primary-logo-white.png')
          .resize({ width: 135 })
          .toBuffer();
        return await sharp(desktopSrc)
          .resize({ width: 1920, height: 1072, fit: 'cover' })
          .composite([{ input: logoBuf, top: 50, left: 60 }])
          .webp({ quality: 90 })
          .toBuffer();
      },
    },
    {
      id: 'diwali-hero-mobile',
      fileKey: 'campaigns/diwali/hero-mobile.webp',
      purpose: 'Homepage Diwali Hero — Mobile Portrait',
      variant: 'mobile' as const,
      process: async () => {
        const monoBuf = await sharp('public/brand/av-monogram-white.png')
          .resize({ width: 110 })
          .toBuffer();
        return await sharp(mobileSrc)
          .resize({ width: 896, height: 1200, fit: 'cover' })
          .composite([{ input: monoBuf, top: 55, left: Math.round((896 - 110) / 2) }])
          .webp({ quality: 88 })
          .toBuffer();
      },
    },
    {
      id: 'diwali-men',
      fileKey: 'campaigns/diwali/men.webp',
      purpose: "Men's Festive Fashion Campaign",
      variant: 'editorial' as const,
      process: async () => {
        const monoBuf = await sharp('public/brand/av-monogram-white.png')
          .resize({ width: 80 })
          .toBuffer();
        return await sharp(mobileSrc)
          .extract({ left: 150, top: 180, width: 480, height: 640 })
          .resize({ width: 600, height: 800 })
          .composite([{ input: monoBuf, top: 30, left: 600 - 110 }])
          .webp({ quality: 88 })
          .toBuffer();
      },
    },
    {
      id: 'diwali-women',
      fileKey: 'campaigns/diwali/women.webp',
      purpose: "Women's Festive Fashion Campaign",
      variant: 'editorial' as const,
      process: async () => {
        const monoBuf = await sharp('public/brand/av-monogram-white.png')
          .resize({ width: 80 })
          .toBuffer();
        return await sharp(mobileSrc)
          .extract({ left: 410, top: 200, width: 480, height: 640 })
          .resize({ width: 600, height: 800 })
          .composite([{ input: monoBuf, top: 30, left: 600 - 110 }])
          .webp({ quality: 88 })
          .toBuffer();
      },
    },
    {
      id: 'diwali-matching-styles',
      fileKey: 'campaigns/diwali/matching-styles.webp',
      purpose: 'Men × Women Matching Styles Festive Showcase',
      variant: 'editorial' as const,
      process: async () => {
        const monoBuf = await sharp('public/brand/av-monogram-white.png')
          .resize({ width: 90 })
          .toBuffer();
        return await sharp(desktopSrc)
          .extract({ left: 700, top: 60, width: 676, height: 708 })
          .resize({ width: 1000, height: 700, fit: 'cover' })
          .composite([{ input: monoBuf, top: 35, left: 40 }])
          .webp({ quality: 88 })
          .toBuffer();
      },
    },
    {
      id: 'diwali-accessories',
      fileKey: 'campaigns/diwali/accessories.webp',
      purpose: 'Festive Accessories & Gifting Showcase',
      variant: 'square' as const,
      process: async () => {
        const monoBuf = await sharp('public/brand/av-monogram-white.png')
          .resize({ width: 75 })
          .toBuffer();
        return await sharp(firstHeroSrc)
          .extract({ left: 280, top: 480, width: 400, height: 280 })
          .resize({ width: 800, height: 560 })
          .composite([{ input: monoBuf, top: 30, left: 800 - 105 }])
          .webp({ quality: 88 })
          .toBuffer();
      },
    },
  ];

  const campaignMetadata: CampaignAssetMetadata[] = [];

  for (const item of assetsToProcess) {
    console.log(`\nProcessing ${item.id} (${item.fileKey})...`);
    const buffer = await item.process();
    const meta = await sharp(buffer).metadata();
    const sizeKb = (buffer.length / 1024).toFixed(1);
    console.log(`Generated WebP: ${meta.width}x${meta.height}, Size: ${sizeKb} KB`);

    console.log(`Uploading ${item.fileKey} to Backblaze B2 & local storage...`);
    const uploadResult = await StorageService.uploadCampaignAsset(buffer, item.fileKey, 'image/webp');
    console.log(`Upload result: provider=${uploadResult.storageProvider}, url=${uploadResult.url}`);

    campaignMetadata.push({
      id: item.id,
      purpose: item.purpose,
      fileKey: item.fileKey,
      url: uploadResult.url,
      width: meta.width || 0,
      height: meta.height || 0,
      sizeBytes: buffer.length,
      format: 'image/webp',
      variant: item.variant,
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  // Connect to MongoDB and save settings
  console.log('\nConnecting to MongoDB to record campaign metadata in Settings...');
  await mongoose.connect(MONGODB_URI);
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
  }

  const existingTheme = settings.seasonalTheme || ({} as any);
  settings.seasonalTheme = {
    ...existingTheme,
    enabled: false, // Preserves original normal theme until admin activates it!
    theme: 'diwali',
    announcementText: '✨ THE DIWALI EDIT — CELEBRATE THE SEASON IN TIMELESS STYLE',
    announcementCtaText: 'EXPLORE THE COLLECTION',
    announcementCtaLink: '/shop?gender=MEN',
    heroHeadline: 'THE DIWALI EDIT',
    heroSubheadline: 'Celebrate the season in timeless style. Architectural silhouettes meet festive warmth.',
    heroDesktopImage: '/api/media/campaigns/diwali/hero-desktop.webp',
    heroMobileImage: '/api/media/campaigns/diwali/hero-mobile.webp',
    heroPrimaryCtaText: 'SHOP FESTIVE MEN →',
    heroPrimaryCtaLink: '/shop?gender=MEN',
    heroSecondaryCtaText: 'SHOP FESTIVE WOMEN →',
    heroSecondaryCtaLink: '/shop?gender=WOMEN',
    matchingStylesImage: '/api/media/campaigns/diwali/matching-styles.webp',
    menImage: '/api/media/campaigns/diwali/men.webp',
    womenImage: '/api/media/campaigns/diwali/women.webp',
    accessoriesImage: '/api/media/campaigns/diwali/accessories.webp',
    campaignStartDate: null,
    campaignEndDate: null,
    campaignAssets: campaignMetadata,
  };

  settings.markModified('seasonalTheme');
  await settings.save();
  console.log('Settings successfully saved to MongoDB with Diwali campaign metadata!');

  console.log('\nSummary of Uploaded Assets:');
  console.table(
    campaignMetadata.map((a) => ({
      ID: a.id,
      Variant: a.variant,
      Dimensions: `${a.width}x${a.height}`,
      'Size (KB)': (a.sizeBytes / 1024).toFixed(1),
      URL: a.url,
    }))
  );

  await mongoose.disconnect();
  console.log('Done!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
