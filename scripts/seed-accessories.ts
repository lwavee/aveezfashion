import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { initialProducts } from '../src/server/db/seedData';
import { Product } from '../src/server/models/Product';
import { Category } from '../src/server/models/Category';

// Load .env.local
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join('=').trim();
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aveez_fashion';

async function seedAccessories() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully!');

  // Fetch all categories to map accessories
  const categories = await Category.find({}).lean();
  const categoryMap = new Map(categories.map((c) => [c.slug, c._id]));

  const accessoriesProducts = initialProducts.filter((p) =>
    p.tags?.includes('accessories')
  );

  console.log(`Found ${accessoriesProducts.length} accessory items to synchronize...`);

  let addedCount = 0;
  for (const p of accessoriesProducts) {
    let catId = categoryMap.get('accessories');
    if (p.slug?.includes('hairband')) catId = categoryMap.get('hairbands') || catId;
    else if (p.slug?.includes('claw-clip')) catId = categoryMap.get('claw-clips') || catId;
    else if (p.slug?.includes('hair-clip') || p.slug?.includes('clips-set'))
      catId = categoryMap.get('hair-clips') || catId;
    else if (p.slug?.includes('keychain')) catId = categoryMap.get('keychains') || catId;
    else if (p.slug?.includes('bag-charm')) catId = categoryMap.get('bag-charms') || catId;
    else if (p.slug?.includes('styling-set') || p.slug?.includes('matching-set'))
      catId = categoryMap.get('matching-sets') || catId;

    const existing = await Product.findOne({ slug: p.slug });
    if (!existing) {
      await Product.create({
        ...p,
        category: catId,
      });
      console.log(`+ Added product: ${p.title} (${p.slug})`);
      addedCount++;
    } else {
      console.log(`= Product already exists: ${p.slug}`);
    }
  }

  console.log(`Completed: ${addedCount} new accessories added. Total products in catalog:`, await Product.countDocuments());
  await mongoose.disconnect();
}

seedAccessories().catch((err) => {
  console.error('Error seeding accessories:', err);
  process.exit(1);
});
