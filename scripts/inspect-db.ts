import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const envLocalPath = path.resolve('.env.local');
if (fs.existsSync(envLocalPath)) {
  fs.readFileSync(envLocalPath, 'utf8').split('\n').forEach((l) => {
    const [k, ...v] = l.trim().split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to DB');
  const collections = await mongoose.connection.db!.listCollections().toArray();
  console.log('Collections in database:');
  for (const c of collections) {
    const count = await mongoose.connection.db!.collection(c.name).countDocuments();
    console.log(` - ${c.name}: ${count}`);
  }

  // Check if any orders exist
  const orders = await mongoose.connection.db!.collection('orders').find({}).toArray();
  console.log('\nOrders in DB:', orders.length);
  orders.forEach((o) => {
    console.log('Order Details:', JSON.stringify(o, null, 2));
  });

  // Check users in DB
  const users = await mongoose.connection.db!.collection('users').find({}).toArray();
  console.log('\nUsers in DB:', users.length);
  users.forEach((u) => console.log('  User:', u.email, u.role, u.firstName, u.lastName));

  // Check products in DB
  const products = await mongoose.connection.db!.collection('products').find({}).toArray();
  console.log('\nProducts in DB:', products.length);
  let totalVariants = 0;
  products.forEach((p) => {
    totalVariants += p.variants?.length || 0;
  });
  console.log('Total Product Variants in DB:', totalVariants);

  // Check reviews, coupons, newsletters
  const reviewsCount = await mongoose.connection.db!.collection('reviews').countDocuments();
  console.log('Reviews in DB:', reviewsCount);
  const couponsCount = await mongoose.connection.db!.collection('coupons').countDocuments();
  console.log('Coupons in DB:', couponsCount);
  const newsletterCount = await mongoose.connection.db!.collection('newsletters').countDocuments();
  console.log('Newsletters in DB:', newsletterCount);

  await mongoose.disconnect();
}

inspect().catch(console.error);
