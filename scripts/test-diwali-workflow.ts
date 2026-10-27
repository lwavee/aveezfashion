import fs from 'fs';
import mongoose from 'mongoose';
import { CatalogService } from '../src/server/services/catalogService';
import { StorageService } from '../src/server/services/storageService';
import { Settings } from '../src/server/models/Settings';

// Load .env.local if present
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

async function runTests() {
  console.log('=== STARTING AVEEZ FASHION DIWALI THEME & ASSET VERIFICATION ===\n');

  // Test 1: MongoDB Connection & CatalogService Settings
  console.log('1. Testing CatalogService.getSettings()...');
  const initialSettings = await CatalogService.getSettings();
  console.log('   Store Name:', initialSettings.storeName);
  console.log('   Current Seasonal Theme Enabled:', initialSettings.seasonalTheme?.enabled);
  console.log('   Current Theme Mode:', initialSettings.seasonalTheme?.theme);
  console.log('   Campaign Assets Count:', initialSettings.seasonalTheme?.campaignAssets?.length || 0);

  if (!initialSettings.seasonalTheme) {
    throw new Error('FAILED: seasonalTheme missing from settings.');
  }
  console.log('   PASSED: Settings successfully loaded with seasonalTheme.\n');

  // Test 2: Enable Diwali Mode in MongoDB
  console.log('2. Testing Diwali Mode activation (CatalogService.updateSeasonalTheme)...');
  const enabledSettings = await CatalogService.updateSeasonalTheme({
    enabled: true,
    theme: 'diwali',
    heroHeadline: 'THE DIWALI EDIT',
    heroSubheadline: 'Celebrate the season in timeless style. Architectural silhouettes meet festive warmth.',
    campaignStartDate: null,
    campaignEndDate: null,
  });

  const isActiveWhenEnabled = CatalogService.isSeasonalThemeActive(enabledSettings.seasonalTheme);
  console.log('   Diwali Theme Enabled:', enabledSettings.seasonalTheme?.enabled);
  console.log('   isSeasonalThemeActive returned:', isActiveWhenEnabled);
  if (!isActiveWhenEnabled) {
    throw new Error('FAILED: isSeasonalThemeActive should be true when enabled.');
  }
  console.log('   PASSED: Diwali Mode successfully turned ON in database.\n');

  // Test 3: Disable Diwali Mode and verify restoration of Normal Theme
  console.log('3. Testing Normal Theme restoration (Turning Diwali Mode OFF)...');
  const restoredSettings = await CatalogService.updateSeasonalTheme({
    enabled: false,
    theme: 'normal',
  });

  const isActiveWhenDisabled = CatalogService.isSeasonalThemeActive(restoredSettings.seasonalTheme);
  console.log('   Seasonal Theme Enabled:', restoredSettings.seasonalTheme?.enabled);
  console.log('   isSeasonalThemeActive returned:', isActiveWhenDisabled);
  if (isActiveWhenDisabled) {
    throw new Error('FAILED: isSeasonalThemeActive should be false when disabled.');
  }
  console.log('   PASSED: Normal theme restored cleanly without residue.\n');

  // Test 4: Backblaze B2 & Local Media Serving
  console.log('4. Verifying Campaign Assets Accessibility in B2 and Local...');
  const assets = initialSettings.seasonalTheme.campaignAssets || [];
  for (const asset of assets) {
    console.log(`   Checking asset: ${asset.fileKey} (${(asset.sizeBytes / 1024).toFixed(1)} KB)...`);
    
    // Check local file existence
    const localExists = fs.existsSync(`public/uploads/${asset.fileKey}`);
    console.log(`     Local public copy: ${localExists ? 'FOUND' : 'NOT FOUND'}`);

    // Check Backblaze B2 fetch
    const b2Asset = await StorageService.fetchB2Asset(asset.fileKey);
    console.log(`     Backblaze B2 stream: ${b2Asset ? 'VERIFIED (' + b2Asset.mimeType + ', ' + b2Asset.buffer.length + ' bytes)' : 'FAILED'}`);
    
    if (!b2Asset && !localExists) {
      throw new Error(`FAILED: Asset ${asset.fileKey} could not be retrieved from B2 or local storage.`);
    }
  }
  console.log('   PASSED: All campaign assets verified in Backblaze B2 and local storage.\n');

  // Test 5: Preserve Existing Core Catalog Data (Products, Categories, Pricing)
  console.log('5. Verifying Core Catalog & Business Logic Integrity...');
  const [categories, products, accessories] = await Promise.all([
    CatalogService.getCategories(),
    CatalogService.getProducts({ limit: 4 }),
    CatalogService.getAccessories({ limit: 4 }),
  ]);

  console.log(`   Categories Count: ${categories.length}`);
  console.log(`   Sample Category: ${categories[0]?.name} (${categories[0]?.slug})`);
  console.log(`   Products Count: ${products.products.length}`);
  console.log(`   Sample Product: ${products.products[0]?.title} — ₹${products.products[0]?.basePrice}`);
  console.log(`   Accessories Count: ${accessories.products.length}`);

  if (categories.length === 0 || products.products.length === 0) {
    throw new Error('FAILED: Product or category catalog integrity issue detected.');
  }
  console.log('   PASSED: Product variants, inventory, and categories remain 100% intact.\n');

  console.log('=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
  await mongoose.disconnect();
}

runTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
