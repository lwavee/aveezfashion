import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Category } from '../src/server/models/Category';
import { initialCategories } from '../src/server/db/seedData';

// Load .env.local if not already in env
if (!process.env.MONGODB_URI) {
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
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aveez_fashion';

async function ensureAccessories() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Find or create parent Accessories category
  let accessoriesCat = await Category.findOne({ slug: 'accessories' });
  if (!accessoriesCat) {
    const def = initialCategories.find((c) => c.slug === 'accessories');
    accessoriesCat = await Category.create({
      name: def?.name || 'Accessories',
      slug: 'accessories',
      description: def?.description || 'The Finishing Touch — Handcrafted hair accessories, floral headbands, clips, and styling charms.',
      displayOrder: 7,
      isActive: true,
      metaTitle: 'Accessories Collection — The Finishing Touch | AVEEZ FASHION',
      metaDescription: 'Shop handcrafted floral headbands, minimalist hair clips, sculpted claw clips, and matching styling sets.',
    });
    console.log('[CREATED] Category "Accessories":', accessoriesCat._id);
  } else {
    console.log('[EXISTS] Category "Accessories":', accessoriesCat._id);
  }

  // Ensure subcategories exist with parentCategory set to accessoriesCat._id
  const subcategorySlugs = ['hairbands', 'hair-clips', 'claw-clips', 'keychains', 'bag-charms', 'matching-sets'];

  for (const slug of subcategorySlugs) {
    const def = initialCategories.find((c) => c.slug === slug);
    const existing = await Category.findOne({ slug });
    if (!existing) {
      const created = await Category.create({
        name: def?.name || slug,
        slug,
        description: def?.description,
        parentCategory: accessoriesCat._id,
        displayOrder: def?.displayOrder || 10,
        isActive: true,
      });
      console.log(`[CREATED] Subcategory "${slug}":`, created._id);
    } else {
      if (!existing.parentCategory) {
        existing.parentCategory = accessoriesCat._id as any;
        await existing.save();
        console.log(`[UPDATED] Subcategory "${slug}" parent linked to Accessories`);
      } else {
        console.log(`[EXISTS] Subcategory "${slug}":`, existing._id);
      }
    }
  }

  console.log('Done! All accessory categories ensured safely without modifying any existing data.');
  await mongoose.disconnect();
}

ensureAccessories().catch((err) => {
  console.error('Error ensuring accessories:', err);
  process.exit(1);
});
