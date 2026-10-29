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

const updates = [
  { slug: 'men', image: '/api/media/categories/men.webp' },
  { slug: 'women', image: '/api/media/categories/women.webp' },
  { slug: 'hoodies', image: '/api/media/categories/hoodies.webp' },
  { slug: 'oversized-tees', image: '/api/media/categories/oversized-tees.webp' },
  { slug: 'bottoms', image: '/api/media/categories/bottoms.webp' },
  { slug: 'shirts', image: '/api/media/categories/shirts.webp' }
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB. Updating category images...');
  for (const u of updates) {
    const res = await mongoose.connection.db.collection('categories').updateOne(
      { slug: u.slug },
      { $set: { image: u.image } }
    );
    console.log(` - Category '${u.slug}' -> ${u.image} (modified: ${res.modifiedCount})`);
  }
  await mongoose.disconnect();
  console.log('Done!');
}

run().catch(console.error);
