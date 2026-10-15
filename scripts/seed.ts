import mongoose from 'mongoose';
import { initialCategories, initialCollections, initialProducts } from '../src/server/db/seedData';
import { Category } from '../src/server/models/Category';
import { Collection } from '../src/server/models/Collection';
import { Product } from '../src/server/models/Product';
import { HomepageContent } from '../src/server/models/HomepageContent';
import { Settings } from '../src/server/models/Settings';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aveez_fashion';

async function seedDatabase() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully!');

  console.log('Clearing old catalog records...');
  await Category.deleteMany({});
  await Collection.deleteMany({});
  await Product.deleteMany({});
  await HomepageContent.deleteMany({});
  await Settings.deleteMany({});

  console.log('Seeding Categories...');
  const createdCategories = await Category.insertMany(initialCategories);
  const categoryMap = new Map(createdCategories.map((c) => [c.slug, c._id]));

  console.log('Seeding Products...');
  const productsWithCatIds = initialProducts.map((p) => {
    // Map to specific categories based on type
    let catId = categoryMap.get('men');
    if (p.slug?.includes('hoodie')) catId = categoryMap.get('hoodies') || catId;
    else if (p.slug?.includes('tee')) catId = categoryMap.get('oversized-tees') || catId;
    else if (p.slug?.includes('trouser')) catId = categoryMap.get('bottoms') || catId;
    else if (p.slug?.includes('shirt')) catId = categoryMap.get('shirts') || catId;
    else if (p.slug?.includes('jacket')) catId = categoryMap.get('women') || catId;
    else if (p.slug?.includes('hairband')) catId = categoryMap.get('hairbands') || categoryMap.get('accessories') || catId;
    else if (p.slug?.includes('claw-clip')) catId = categoryMap.get('claw-clips') || categoryMap.get('accessories') || catId;
    else if (p.slug?.includes('hair-clip') || p.slug?.includes('clips-set')) catId = categoryMap.get('hair-clips') || categoryMap.get('accessories') || catId;
    else if (p.slug?.includes('keychain')) catId = categoryMap.get('keychains') || categoryMap.get('accessories') || catId;
    else if (p.slug?.includes('bag-charm')) catId = categoryMap.get('bag-charms') || categoryMap.get('accessories') || catId;
    else if (p.slug?.includes('styling-set') || p.slug?.includes('matching-set')) catId = categoryMap.get('matching-sets') || categoryMap.get('accessories') || catId;

    return {
      ...p,
      category: catId,
    };
  });

  const createdProducts = await Product.insertMany(productsWithCatIds);
  const productIds = createdProducts.map((p) => p._id);

  console.log('Seeding Collections...');
  const collectionsWithProducts = initialCollections.map((col) => ({
    ...col,
    products: productIds.slice(0, 4),
  }));
  await Collection.insertMany(collectionsWithProducts);

  console.log('Seeding Homepage Content & Settings...');
  await HomepageContent.create({});
  await Settings.create({});

  console.log('Database seeded successfully with Aveez Fashion catalog!');
  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
