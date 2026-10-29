const fs = require('fs');
const mongoose = require('mongoose');

if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (k && !process.env[k]) process.env[k] = v;
    }
  });
}

async function inspectDb() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  console.log('--- DB INSPECTION ---');
  const db = mongoose.connection.db;

  const products = await db.collection('products').find({}).toArray();
  console.log(`\nProducts count: ${products.length}`);
  products.forEach(p => {
    console.log(` - [${p._id}] ${p.title} | Slug: ${p.slug} | Price: ₹${p.basePrice} | Category: ${p.category} | Images: ${p.images?.length || 0}`);
    p.images?.forEach((img, i) => console.log(`     img[${i}]: ${img.url || img}`));
  });

  const categories = await db.collection('categories').find({ isActive: true }).toArray();
  console.log(`\nActive Categories count: ${categories.length}`);
  categories.slice(0, 15).forEach(c => {
    console.log(` - ${c.name} (${c.slug}) | Parent: ${c.parentSlug || 'root'} | Image: ${c.image || 'none'}`);
  });

  const collections = await db.collection('collections').find({}).toArray();
  console.log(`\nCollections count: ${collections.length}`);
  collections.forEach(c => {
    console.log(` - ${c.title} (${c.slug}) | Cover: ${c.coverImage || 'none'}`);
  });

  const settings = await db.collection('settings').findOne({});
  console.log('\nSettings Doc:');
  console.log('Seasonal Theme enabled:', settings?.seasonalTheme?.enabled);
  console.log('Theme:', settings?.seasonalTheme?.theme);
  console.log('Hero Desktop:', settings?.seasonalTheme?.heroDesktopImage);
  console.log('Hero Mobile:', settings?.seasonalTheme?.heroMobileImage);
  console.log('Campaign Assets count:', settings?.seasonalTheme?.campaignAssets?.length || 0);

  await mongoose.disconnect();
}

inspectDb().catch(console.error);
